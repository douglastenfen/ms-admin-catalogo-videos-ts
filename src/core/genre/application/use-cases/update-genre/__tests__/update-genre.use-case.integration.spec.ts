import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import {
  UpdateGenreOutput,
  UpdateGenreUseCase,
} from '../update-genre.use-case';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { UpdateGenreInput } from '../update-genre.input';

describe('UpdateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: UpdateGenreUseCase;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let categoriesIdsExistsInDbValidator: CategoriesIdExistsInDatabaseValidator;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    categoriesIdsExistsInDbValidator =
      new CategoriesIdExistsInDatabaseValidator(categoryRepository);
    useCase = new UpdateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoriesIdsExistsInDbValidator,
    );
  });

  it('should update a genre', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);
    const entity = Genre.fake()
      .aGenre()
      .addCategoriesId(categories[1].categoryID)
      .build();
    await genreRepository.insert(entity);

    let output = await useCase.execute(
      new UpdateGenreInput({
        genreId: entity.genreId.id,
        name: 'test',
        categoriesId: [categories[0].categoryID.id],
      }),
    );
    expect(output).toStrictEqual({
      genreId: entity.genreId.id,
      name: 'test',
      categories: expect.arrayContaining(
        [categories[0]].map((e) => ({
          categoryId: e.categoryID.id,
          name: e.name,
          createdAt: e.createdAt,
        })),
      ),
      categoriesId: expect.arrayContaining([categories[0].categoryID.id]),
      isActive: true,
      createdAt: entity.createdAt,
    });

    type Arrange = {
      input: UpdateGenreInput;
      expected: UpdateGenreOutput;
    };

    const arrange: Arrange[] = [
      {
        input: {
          genreId: entity.genreId.id,
          categoriesId: [
            categories[1].categoryID.id,
            categories[2].categoryID.id,
          ],
          isActive: true,
        },
        expected: {
          genreId: entity.genreId.id,
          name: 'test',
          categories: expect.arrayContaining(
            [categories[1], categories[2]].map((e) => ({
              categoryId: e.categoryID.id,
              name: e.name,
              createdAt: e.createdAt,
            })),
          ),
          categoriesId: expect.arrayContaining([
            categories[1].categoryID.id,
            categories[2].categoryID.id,
          ]),
          isActive: true,
          createdAt: entity.createdAt,
        },
      },
      {
        input: {
          genreId: entity.genreId.id,
          name: 'test changed',
          categoriesId: [
            categories[1].categoryID.id,
            categories[2].categoryID.id,
          ],
          isActive: false,
        },
        expected: {
          genreId: entity.genreId.id,
          name: 'test changed',
          categories: expect.arrayContaining(
            [categories[1], categories[2]].map((e) => ({
              categoryId: e.categoryID.id,
              name: e.name,
              createdAt: e.createdAt,
            })),
          ),
          categoriesId: expect.arrayContaining([
            categories[1].categoryID.id,
            categories[2].categoryID.id,
          ]),
          isActive: false,
          createdAt: entity.createdAt,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute(i.input);
      const entityUpdated = await genreRepository.findByID(
        new GenreId(i.input.genreId),
      );
      expect(output).toStrictEqual({
        genreId: entity.genreId.id,
        name: i.expected.name,
        categories: i.expected.categories,
        categoriesId: i.expected.categoriesId,
        isActive: i.expected.isActive,
        createdAt: i.expected.createdAt,
      });
      expect(entityUpdated!.toJSON()).toStrictEqual({
        genreId: entity.genreId.id,
        name: i.expected.name,
        categoriesId: i.expected.categoriesId,
        isActive: i.expected.isActive,
        createdAt: i.expected.createdAt,
      });
    }
  });

  it('rollback transaction', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const entity = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(entity);

    GenreModel.afterBulkUpdate('hook-test', () => {
      return Promise.reject(new Error('Generic Error'));
    });

    await expect(
      useCase.execute(
        new UpdateGenreInput({
          genreId: entity.genreId.id,
          name: 'test',
          categoriesId: [category.categoryID.id],
        }),
      ),
    ).rejects.toThrow(new Error('Generic Error'));

    GenreModel.removeHook('afterBulkUpdate', 'hook-test');

    const notUpdatedGenre = await genreRepository.findByID(entity.genreId);
    expect(notUpdatedGenre!.name).toStrictEqual(entity.name);
  });
});

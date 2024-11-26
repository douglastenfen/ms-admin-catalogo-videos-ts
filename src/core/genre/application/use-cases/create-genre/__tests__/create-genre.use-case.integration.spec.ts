import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { CreateGenreUseCase } from '../create-genre.use-case';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { DatabaseError } from 'sequelize';

describe('CreateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateGenreUseCase;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let categoriesIdExistsInDbValidator: CategoriesIdExistsInDatabaseValidator;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    categoriesIdExistsInDbValidator = new CategoriesIdExistsInDatabaseValidator(
      categoryRepository,
    );
    useCase = new CreateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoriesIdExistsInDbValidator,
    );
  });

  it('should create a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const categoriesId = categories.map((category) => category.categoryID.id);

    let output = await useCase.execute({
      name: 'test',
      categoriesId,
    });

    let genre = await genreRepository.findByID(new GenreId(output.genreId));
    expect(output).toStrictEqual({
      genreId: genre!.genreId.id,
      name: 'test',
      categories: expect.arrayContaining(
        categories.map((c) => ({
          categoryId: c.categoryID.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
      ),
      categoriesId: expect.arrayContaining(categoriesId),
      isActive: true,
      createdAt: genre!.createdAt,
    });

    output = await useCase.execute({
      name: 'test',
      categoriesId: [categories[0].categoryID.id],
      isActive: true,
    });

    genre = await genreRepository.findByID(new GenreId(output.genreId));
    expect(output).toStrictEqual({
      genreId: genre!.genreId.id,
      name: 'test',
      categories: expect.arrayContaining(
        [categories[0]].map((c) => ({
          categoryId: c.categoryID.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
      ),
      categoriesId: expect.arrayContaining([categories[0].categoryID.id]),
      isActive: true,
      createdAt: genre!.createdAt,
    });
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const categoriesId = categories.map((category) => category.categoryID.id);

    const genre = Genre.fake().aGenre().build();
    genre.name = 't'.repeat(256);

    // Mock the create method to throw an error
    const mockCreate = jest
      .spyOn(Genre, 'create')
      .mockImplementation(() => genre);

    await expect(
      useCase.execute({
        name: 'test',
        categoriesId,
      }),
    ).rejects.toThrow(DatabaseError);

    const genres = await genreRepository.findAll();
    expect(genres).toHaveLength(0);

    mockCreate.mockRestore();
  });
});

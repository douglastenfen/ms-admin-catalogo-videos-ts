import { Category } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { GetGenreUseCase } from '../get-genre.use-case';

describe('GetGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: GetGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetGenreUseCase(genreRepo, categoryRepo);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(() =>
      useCase.execute({ genreId: genreId.id }),
    ).rejects.toThrow(new NotFoundError(genreId.id, Genre));
  });

  it('should returns a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(categories[0].categoryID)
      .addCategoriesId(categories[1].categoryID)
      .build();
    await genreRepo.insert(genre);
    const output = await useCase.execute({ genreId: genre.genreId.id });
    expect(output).toStrictEqual({
      genreId: genre.genreId.id,
      name: genre.name,
      categories: expect.arrayContaining([
        expect.objectContaining({
          categoryId: categories[0].categoryID.id,
          name: categories[0].name,
          createdAt: categories[0].createdAt,
        }),
        expect.objectContaining({
          categoryId: categories[1].categoryID.id,
          name: categories[1].name,
          createdAt: categories[1].createdAt,
        }),
      ]),
      categoriesId: expect.arrayContaining([
        categories[0].categoryID.id,
        categories[1].categoryID.id,
      ]),
      isActive: true,
      createdAt: genre.createdAt,
    });
  });
});

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
import { DeleteGenreUseCase } from '../delete-genre.use-case';

describe('DeleteGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: DeleteGenreUseCase;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    useCase = new DeleteGenreUseCase(uow, genreRepository);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(() =>
      useCase.execute({ genreId: genreId.id }),
    ).rejects.toThrow(new NotFoundError(genreId.id, Genre));
  });

  it('should delete a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(categories[0].categoryID)
      .addCategoriesId(categories[1].categoryID)
      .build();
    await genreRepository.insert(genre);
    await useCase.execute({
      genreId: genre.genreId.id,
    });
    await expect(genreRepository.findByID(genre.genreId)).resolves.toBeNull();
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(categories[0].categoryID)
      .addCategoriesId(categories[1].categoryID)
      .build();
    await genreRepository.insert(genre);

    GenreModel.afterBulkDestroy('hook-test', () => {
      return Promise.reject(new Error('Generic Error'));
    });

    await expect(
      useCase.execute({
        genreId: genre.genreId.id,
      }),
    ).rejects.toThrow('Generic Error');

    GenreModel.removeHook('afterBulkDestroy', 'hook-test');

    const genres = await genreRepository.findAll();
    expect(genres.length).toEqual(1);
  });
});

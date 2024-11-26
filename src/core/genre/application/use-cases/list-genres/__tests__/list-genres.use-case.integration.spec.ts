import { Category } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { GenreOutputMapper } from '../../common/genre-output';
import { ListGenresUseCase } from '../list-genres.use-case';

describe('ListGenresUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: ListGenresUseCase;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    useCase = new ListGenresUseCase(genreRepository, categoryRepository);
  });

  it('should return output sorted by createdAt when input param is empty', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);
    const genres = Genre.fake()
      .theGenres(16)
      .withCreatedAt((index) => new Date(new Date().getTime() + 1000 + index))
      .addCategoriesId(categories[0].categoryID)
      .addCategoriesId(categories[1].categoryID)
      .addCategoriesId(categories[2].categoryID)
      .build();
    await genreRepository.bulkInsert(genres);
    const output = await useCase.execute({});
    expect(output).toEqual({
      items: [...genres]
        .reverse()
        .slice(0, 15)
        .map((i) => formatOutput(i, categories)),
      total: 16,
      currentPage: 1,
      lastPage: 2,
      perPage: 15,
    });
  });

  describe('should search applying filter by name, sort and paginate', () => {
    const categories = Category.fake().theCategories(3).build();
    const genres = [
      Genre.fake()
        .aGenre()
        .withName('test')
        .withCreatedAt(new Date(new Date().getTime() + 4000))
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('a')
        .withCreatedAt(new Date(new Date().getTime() + 3000))
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TEST')
        .withCreatedAt(new Date(new Date().getTime() + 2000))
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TeSt')
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [genres[2], genres[3]].map((i) => formatOutput(i, categories)),
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [genres[0]].map((i) => formatOutput(i, categories)),
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)(
      'when value is $searchParams',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toEqual(expectedOutput);
      },
    );
  });

  describe('should search applying filter by categoriesId, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const genres = [
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .withName('test')
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .withName('a')
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .withName('TEST')
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[3].categoryID)
        .withName('e')
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .withName('TeSt')
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { categoriesId: [categories[0].categoryID.id] },
        },
        output: {
          items: [
            formatOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
            formatOutput(genres[1], [categories[0], categories[1]]),
          ],
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { categoriesId: [categories[0].categoryID.id] },
        },
        output: {
          items: [formatOutput(genres[0], [categories[0]])],
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)(
      'when value is $searchParams',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toEqual(expectedOutput);
      },
    );
  });

  describe('should search using filter by name and categoriesId, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const genres = [
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .withName('test')
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .withName('a')
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .withName('TEST')
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[3].categoryID)
        .withName('e')
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .withName('TeSt')
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: {
            name: 'TEST',
            categoriesId: [categories[1].categoryID.id],
          },
        },
        output: {
          items: [
            formatOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
            formatOutput(genres[4], [categories[1], categories[2]]),
          ],
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: {
            name: 'TEST',
            categoriesId: [categories[1].categoryID.id],
          },
        },
        output: {
          items: [formatOutput(genres[0], [categories[0]])],
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)(
      'when value is $searchParams',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toEqual(expectedOutput);
      },
    );
  });
});

function formatOutput(genre, categories) {
  const output = GenreOutputMapper.toOutput(genre, categories);
  return {
    ...output,
    categories: expect.arrayContaining(
      output.categories.map((c) => expect.objectContaining(c)),
    ),
    categoriesId: expect.arrayContaining(output.categoriesId),
  };
}

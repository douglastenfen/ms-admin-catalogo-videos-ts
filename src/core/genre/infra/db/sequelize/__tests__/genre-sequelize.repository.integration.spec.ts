import { Category } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import {
  GenreSearchParams,
  GenreSearchResult,
} from '@core/genre/domain/genre.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { GenreSequelizeRepository } from '../genre-sequelize.repository';
import { GenreCategoryModel, GenreModel } from '../genre.model';
import { GenreModelMapper } from '../genre.model.mapper';

describe('GenreSequelizeRepository Integration Tests', () => {
  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  let uow: UnitOfWorkSequelize;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
  });

  it('should insert a new genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(genre);

    const newGenre = await genreRepository.findByID(genre.genreId);

    expect(newGenre!.toJSON()).toStrictEqual(genre.toJSON());
  });

  it('should bulk insert genres', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);

    const genres = Genre.fake()
      .theGenres(2)
      .addCategoriesId(categories[0].categoryID)
      .addCategoriesId(categories[1].categoryID)
      .addCategoriesId(categories[2].categoryID)
      .build();

    await genreRepository.bulkInsert(genres);

    const newGenres = await genreRepository.findAll();

    expect(newGenres).toHaveLength(2);

    expect(newGenres[0].toJSON()).toStrictEqual({
      ...genres[0].toJSON(),
      categoriesId: expect.arrayContaining([
        categories[0].categoryID.id,
        categories[1].categoryID.id,
        categories[2].categoryID.id,
      ]),
    });

    expect(newGenres[1].toJSON()).toStrictEqual({
      ...genres[1].toJSON(),
      categoriesId: expect.arrayContaining([
        categories[0].categoryID.id,
        categories[1].categoryID.id,
        categories[2].categoryID.id,
      ]),
    });
  });

  it('should find a genre by id', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(genre);

    const newGenre = await genreRepository.findByID(genre.genreId);

    expect(newGenre!.toJSON()).toStrictEqual(genre.toJSON());

    await expect(genreRepository.findByID(new GenreId())).resolves.toBeNull();
  });

  it('should return all genres', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();

    await genreRepository.insert(genre);

    const genres = await genreRepository.findAll();

    expect(genres).toHaveLength(1);
    expect(JSON.stringify(genres)).toBe(JSON.stringify([genre]));
  });

  it('should throw an error on update when genre not found', async () => {
    const genre = Genre.fake().aGenre().build();

    await expect(genreRepository.update(genre)).rejects.toThrow(
      new NotFoundError(genre.genreId.id, Genre),
    );
  });

  it('should update a genre', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);

    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(categories[0].categoryID)
      .build();

    await genreRepository.insert(genre);

    genre.changeName('new name');
    genre.syncCategoriesId([categories[1].categoryID]);

    await genreRepository.update(genre);

    let genreFound = await genreRepository.findByID(genre.genreId);
    expect(genreFound!.toJSON()).toStrictEqual(genre.toJSON());

    await expect(GenreCategoryModel.count()).resolves.toBe(1);

    genre.addCategoryId(categories[0].categoryID);
    await genreRepository.update(genre);

    genreFound = await genreRepository.findByID(genre.genreId);
    expect(genre.toJSON()).toStrictEqual({
      ...genreFound!.toJSON(),
      categoriesId: expect.arrayContaining([
        categories[0].categoryID.id,
        categories[1].categoryID.id,
      ]),
    });
  });

  it('should throw an error on delete when genre not found', async () => {
    const genreId = new GenreId();

    await expect(genreRepository.delete(genreId)).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );

    await expect(
      genreRepository.delete(
        new GenreId('9c7b3b9e-1b1d-4b3b-8b6d-3b1b3b9c7b3b'),
      ),
    ).rejects.toThrow(
      new NotFoundError('9c7b3b9e-1b1d-4b3b-8b6d-3b1b3b9c7b3b', Genre),
    );
  });

  it('should delete a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(genre);

    await genreRepository.delete(genre.genreId);

    const genreFound = await GenreModel.findByPk(genre.genreId.id);

    expect(genreFound).toBeNull();

    await expect(GenreCategoryModel.count()).resolves.toBe(0);
  });

  describe('search method tests', () => {
    it('should order by createdAt DESC when search params are null', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepository.bulkInsert(categories);

      const genres = Genre.fake()
        .theGenres(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build();
      await genreRepository.bulkInsert(genres);

      const spyToEntity = jest.spyOn(GenreModelMapper, 'toEntity');

      const searchOutput = await genreRepository.search(
        GenreSearchParams.create(),
      );

      expect(searchOutput).toBeInstanceOf(GenreSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });

      [...genres.slice(1, 16)].reverse().forEach((item, index) => {
        expect(searchOutput.items[index]).toBeInstanceOf(Genre);

        const expected = searchOutput.items[index].toJSON();

        expect(item.toJSON()).toStrictEqual({
          ...expected,
          categoriesId: expect.arrayContaining([
            categories[0].categoryID.id,
            categories[1].categoryID.id,
            categories[2].categoryID.id,
          ]),
        });
      });
    });

    it('should apply pagination and filter by name', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepository.bulkInsert(categories);

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
      await genreRepository.bulkInsert(genres);

      let searchOutput = await genreRepository.search(
        GenreSearchParams.create({
          page: 1,
          perPage: 2,
          filter: { name: 'TEST' },
        }),
      );

      let expected = new GenreSearchResult({
        items: [genres[0], genres[2]],
        total: 3,
        currentPage: 1,
        perPage: 2,
      }).toJSON(true);

      expect(searchOutput.toJSON(true)).toMatchObject({
        ...expected,
        items: [
          {
            ...expected.items[0],
            categoriesId: expect.arrayContaining([
              categories[0].categoryID.id,
              categories[1].categoryID.id,
              categories[2].categoryID.id,
            ]),
          },
          {
            ...expected.items[1],
            categoriesId: expect.arrayContaining([
              categories[0].categoryID.id,
              categories[1].categoryID.id,
              categories[2].categoryID.id,
            ]),
          },
        ],
      });

      expected = new GenreSearchResult({
        items: [genres[3]],
        total: 3,
        currentPage: 2,
        perPage: 2,
      }).toJSON(true);

      searchOutput = await genreRepository.search(
        GenreSearchParams.create({
          perPage: 2,
          page: 2,
          filter: { name: 'TEST' },
        }),
      );

      expect(searchOutput.toJSON(true)).toMatchObject({
        ...expected,
        items: [
          {
            ...expected.items[0],
            categoriesId: expect.arrayContaining([
              categories[0].categoryID.id,
              categories[1].categoryID.id,
              categories[2].categoryID.id,
            ]),
          },
        ],
      });
    });

    it('should apply pagination and filter by categoriesId', async () => {
      const categories = Category.fake().theCategories(4).build();
      await categoryRepository.bulkInsert(categories);

      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[3].categoryID)
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
      ];
      await genreRepository.bulkInsert(genres);

      const arrange = [
        {
          params: GenreSearchParams.create({
            page: 1,
            perPage: 2,
            filter: { categoriesId: [categories[0].categoryID.id] },
          }),
          result: {
            items: [genres[2], genres[1]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          },
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            perPage: 2,
            filter: { categoriesId: [categories[0].categoryID.id] },
          }),
          result: {
            items: [genres[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          },
        },
        {
          params: GenreSearchParams.create({
            page: 1,
            perPage: 2,
            filter: {
              categoriesId: [
                categories[0].categoryID.id,
                categories[1].categoryID.id,
              ],
            },
          }),
          result: {
            items: [genres[4], genres[2]],
            total: 4,
            currentPage: 1,
            perPage: 2,
          },
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            perPage: 2,
            filter: {
              categoriesId: [
                categories[0].categoryID.id,
                categories[1].categoryID.id,
              ],
            },
          }),
          result: {
            items: [genres[1], genres[0]],
            total: 4,
            currentPage: 2,
            perPage: 2,
          },
        },
      ];

      for (const arrangeItem of arrange) {
        const searchOutput = await genreRepository.search(arrangeItem.params);

        const { items, ...otherOutput } = searchOutput;
        const { items: itemsExpected, ...otherExpected } = arrangeItem.result;

        expect(otherOutput).toMatchObject(otherExpected);
        expect(searchOutput.items.length).toBe(itemsExpected.length);

        searchOutput.items.forEach((item, key) => {
          const expected = itemsExpected[key].toJSON();

          expect(item.toJSON()).toStrictEqual(
            expect.objectContaining({
              ...expected,
              categoriesId: expect.arrayContaining(expected.categoriesId),
            }),
          );
        });
      }
    });

    it('should apply paginate and sort', async () => {
      expect(genreRepository.sortableFields).toStrictEqual([
        'name',
        'createdAt',
      ]);

      const categories = Category.fake().theCategories(4).build();
      await categoryRepository.bulkInsert(categories);

      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withName('b')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withName('a')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withName('d')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withName('e')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withName('c')
          .build(),
      ];

      await genreRepository.bulkInsert(genres);

      const arrange = [
        {
          params: GenreSearchParams.create({
            page: 1,
            perPage: 2,
            sort: 'name',
          }),
          result: new GenreSearchResult({
            items: [genres[1], genres[0]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            perPage: 2,
            sort: 'name',
          }),
          result: new GenreSearchResult({
            items: [genres[4], genres[2]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          result: new GenreSearchResult({
            items: [genres[3], genres[2]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          result: new GenreSearchResult({
            items: [genres[4], genres[0]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await genreRepository.search(i.params);

        const expected = i.result.toJSON(true);

        expect(result.toJSON(true)).toMatchObject({
          ...expected,
          items: expected.items.map((item) => ({
            ...item,
            categoriesId: expect.arrayContaining(item.categoriesId),
          })),
        });
      }
    });

    describe('should search using filter by name, sort and paginate', () => {
      const categories = Category.fake().theCategories(3).build();

      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withName('test')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
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
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withName('e')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categories[0].categoryID)
          .addCategoriesId(categories[1].categoryID)
          .addCategoriesId(categories[2].categoryID)
          .withName('TeSt')
          .build(),
      ];

      const arrange = [
        {
          searchParams: GenreSearchParams.create({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          searchResult: new GenreSearchResult({
            items: [genres[2], genres[4]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          searchParams: GenreSearchParams.create({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          searchResult: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepository.bulkInsert(categories);
        await genreRepository.bulkInsert(genres);
      });

      test.each(arrange)(
        'when value is $searchParams',
        async ({ searchParams, searchResult }) => {
          const result = await genreRepository.search(searchParams);

          const expected = searchResult.toJSON(true);

          expect(result.toJSON(true)).toMatchObject({
            ...expected,
            items: expected.items.map((item) => ({
              ...item,
              categoriesId: expect.arrayContaining(item.categoriesId),
            })),
          });
        },
      );
    });

    describe('should search using filter by categoriesId, sort and paginate', () => {
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
          searchParams: GenreSearchParams.create({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: { categoriesId: [categories[0].categoryID.id] },
          }),
          searchResult: new GenreSearchResult({
            items: [genres[2], genres[1]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          searchParams: GenreSearchParams.create({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: { categoriesId: [categories[0].categoryID.id] },
          }),
          searchResult: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepository.bulkInsert(categories);
        await genreRepository.bulkInsert(genres);
      });

      test.each(arrange)(
        'when value is $searchParams',
        async ({ searchParams, searchResult }) => {
          const result = await genreRepository.search(searchParams);

          const expected = searchResult.toJSON(true);

          expect(result.toJSON(true)).toMatchObject({
            ...expected,
            items: expected.items.map((item) => ({
              ...item,
              categoriesId: expect.arrayContaining(item.categoriesId),
            })),
          });
        },
      );
    });

    describe('should search using filter by name, categoriesId, sort and paginate', () => {
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
          searchParams: GenreSearchParams.create({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: {
              name: 'TEST',
              categoriesId: [categories[1].categoryID],
            },
          }),
          searchResult: new GenreSearchResult({
            items: [genres[2], genres[4]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          searchParams: GenreSearchParams.create({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: {
              name: 'TEST',
              categoriesId: [categories[1].categoryID],
            },
          }),
          searchResult: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepository.bulkInsert(categories);
        await genreRepository.bulkInsert(genres);
      });

      test.each(arrange)(
        'when value is $searchParams',
        async ({ searchParams, searchResult }) => {
          const result = await genreRepository.search(searchParams);

          const expected = searchResult.toJSON(true);

          expect(result.toJSON(true)).toMatchObject({
            ...expected,
            items: expected.items.map((item) => ({
              ...item,
              categoriesId: expect.arrayContaining(item.categoriesId),
            })),
          });
        },
      );
    });
  });

  describe('transaction mode', () => {
    describe('insert method', () => {
      it('should insert a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoriesId(category.categoryID)
          .build();

        await uow.start();

        await genreRepository.insert(genre);

        await uow.commit();

        const result = await genreRepository.findByID(genre.genreId);

        expect(genre.genreId).toBeValueObject(result!.genreId);
      });

      it('rollback the insertion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoriesId(category.categoryID)
          .build();

        await uow.start();

        await genreRepository.insert(genre);

        await uow.rollback();

        await expect(
          genreRepository.findByID(genre.genreId),
        ).resolves.toBeNull();
      });
    });

    describe('bulkInsert method', () => {
      it('should insert a list of genres', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genres = Genre.fake()
          .theGenres(2)
          .addCategoriesId(category.categoryID)
          .build();

        await uow.start();

        await genreRepository.bulkInsert(genres);

        await uow.commit();

        const [genre1, genre2] = await Promise.all([
          genreRepository.findByID(genres[0].genreId),
          genreRepository.findByID(genres[1].genreId),
        ]);

        expect(genre1!.genreId).toBeValueObject(genres[0].genreId);
        expect(genre2!.genreId).toBeValueObject(genres[1].genreId);
      });

      it('rollback bulk insertion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genres = Genre.fake()
          .theGenres(2)
          .addCategoriesId(category.categoryID)
          .build();

        await uow.start();

        await genreRepository.bulkInsert(genres);

        await uow.rollback();

        await expect(
          genreRepository.findByID(genres[0].genreId),
        ).resolves.toBeNull();

        await expect(
          genreRepository.findByID(genres[1].genreId),
        ).resolves.toBeNull();
      });
    });

    describe('findById method', () => {
      it('should find a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoriesId(category.categoryID)
          .build();

        await uow.start();
        await genreRepository.insert(genre);

        const result = await genreRepository.findByID(genre.genreId);

        expect(result!.genreId).toBeValueObject(genre.genreId);

        await uow.commit();
      });
    });

    describe('findAll method', () => {
      it('should find all genres', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genres = Genre.fake()
          .theGenres(2)
          .addCategoriesId(category.categoryID)
          .build();

        await uow.start();

        await genreRepository.bulkInsert(genres);

        const result = await genreRepository.findAll();

        expect(result).toHaveLength(2);

        await uow.commit();
      });
    });

    describe('update method', () => {
      it('should update a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoriesId(category.categoryID)
          .build();

        await genreRepository.insert(genre);

        await uow.start();

        genre.changeName('new name');
        await genreRepository.update(genre);

        await uow.commit();

        const result = await genreRepository.findByID(genre.genreId);

        expect(result!.name).toBe(genre.name);
      });

      it('should rollback the update', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoriesId(category.categoryID)
          .build();

        await genreRepository.insert(genre);

        await uow.start();

        genre.changeName('new name');

        await genreRepository.update(genre);

        await uow.rollback();

        const notChangedGenre = await genreRepository.findByID(genre.genreId);

        expect(notChangedGenre!.name).not.toBe(genre.name);
      });
    });

    describe('delete method', () => {
      it('should delete a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoriesId(category.categoryID)
          .build();

        await genreRepository.insert(genre);

        await uow.start();

        await genreRepository.delete(genre.genreId);

        await uow.commit();

        await expect(
          genreRepository.findByID(genre.genreId),
        ).resolves.toBeNull();
      });

      it('should rollback the deletion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoriesId(category.categoryID)
          .build();

        await genreRepository.insert(genre);

        await uow.start();

        await genreRepository.delete(genre.genreId);

        await uow.rollback();

        const result = await genreRepository.findByID(genre.genreId);

        expect(result!.genreId).toBeValueObject(genre.genreId);
        expect(result!.categoriesId.size).toBe(1);
      });
    });

    describe('search method', () => {
      it('should return a list of genres', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genres = Genre.fake()
          .theGenres(2)
          .withName('genre')
          .addCategoriesId(category.categoryID)
          .build();

        await uow.start();

        await genreRepository.bulkInsert(genres);

        const searchParams = GenreSearchParams.create({
          filter: { name: 'genre' },
        });
        const result = await genreRepository.search(searchParams);

        expect(result.items).toHaveLength(2);
        expect(result.total).toBe(2);

        await uow.commit();
      });
    });
  });
});

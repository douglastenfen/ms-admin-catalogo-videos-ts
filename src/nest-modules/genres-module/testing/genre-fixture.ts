import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { SortDirection } from '@core/shared/domain/repository/search-params';

const _keysInResponse = [
  'genreId',
  'name',
  'categoriesId',
  'categories',
  'isActive',
  'createdAt',
];

export class GetGenreFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateGenreFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Genre.fake().aGenre().withName('test name');

    const category = Category.fake().aCategory().build();

    const case1 = {
      relations: {
        categories: [category],
      },
      sendData: {
        name: faker.name,
        categoriesId: [category.categoryID.id],
      },
      expected: {
        name: faker.name,
        categories: expect.arrayContaining([
          {
            categoryId: category.categoryID.id,
            name: category.name,
            createdAt: category.createdAt.toISOString(),
          },
        ]),
        categoriesId: expect.arrayContaining([category.categoryID.id]),
        isActive: true,
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const case2 = {
      relations: {
        categories,
      },
      sendData: {
        name: faker.name,
        categoriesId: [
          categories[0].categoryID.id,
          categories[1].categoryID.id,
          categories[2].categoryID.id,
        ],
        categories: expect.arrayContaining([
          {
            categoryId: categories[0].categoryID.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt.toISOString(),
          },
          {
            categoryId: categories[1].categoryID.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt.toISOString(),
          },
          {
            categoryId: categories[2].categoryID.id,
            name: categories[2].name,
            createdAt: categories[2].createdAt.toISOString(),
          },
        ]),
        isActive: false,
      },
      expected: {
        name: faker.name,
        categoriesId: expect.arrayContaining([
          categories[0].categoryID.id,
          categories[1].categoryID.id,
          categories[2].categoryID.id,
        ]),
        categories: expect.arrayContaining([
          {
            categoryId: categories[0].categoryID.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt.toISOString(),
          },
          {
            categoryId: categories[1].categoryID.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt.toISOString(),
          },
          {
            categoryId: categories[2].categoryID.id,
            name: categories[2].name,
            createdAt: categories[2].createdAt.toISOString(),
          },
        ]),
        isActive: false,
      },
    };

    return [case1, case2];
  }

  static arrangeInvalidRequest() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      EMPTY: {
        sendData: {},
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'categoriesId should not be empty',
            'categoriesId must be an array',
            'each value in categoriesId must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        sendData: {
          name: undefined,
          categoriesId: [faker.categoriesId[0].id],
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        sendData: {
          name: null,
          categoriesId: [faker.categoriesId[0].id],
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        sendData: {
          name: '',
          categoriesId: [faker.categoriesId[0].id],
        },
        expected: {
          message: ['name should not be empty'],
          ...defaultExpected,
        },
      },
      CATEGORIESID_UNDEFINED: {
        sendData: {
          name: faker.name,
          categoriesId: undefined,
        },
        expected: {
          message: [
            'categoriesId should not be empty',
            'categoriesId must be an array',
            'each value in categoriesId must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIESID_NULL: {
        sendData: {
          name: faker.name,
          categoriesId: null,
        },
        expected: {
          message: [
            'categoriesId should not be empty',
            'categoriesId must be an array',
            'each value in categoriesId must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIESID_EMPTY: {
        sendData: {
          name: faker.name,
          categoriesId: '',
        },
        expected: {
          message: [
            'categoriesId should not be empty',
            'categoriesId must be an array',
            'each value in categoriesId must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIESID_NOT_VALID: {
        sendData: {
          name: faker.name,
          categoriesId: ['a'],
        },
        expected: {
          message: ['each value in categoriesId must be a UUID'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        sendData: {
          name: faker.withInvalidNameTooLong().name,
          categoriesId: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: [
            'name must be shorter than or equal to 255 characters',
            'Category Not Found using ID d8952775-5f69-42d5-9e94-00f097e1b98c',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIESID_NOT_EXISTS: {
        sendData: {
          name: faker.withName('action').name,
          categoriesId: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: [
            'Category Not Found using ID d8952775-5f69-42d5-9e94-00f097e1b98c',
          ],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateGenreFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Genre.fake().aGenre().withName('test name');

    const category = Category.fake().aCategory().build();

    const case1 = {
      entity: faker.addCategoriesId(category.categoryID).build(),
      relations: {
        categories: [category],
      },
      sendData: {
        name: faker.name,
        categoriesId: [category.categoryID.id],
      },
      expected: {
        name: faker.name,
        categoriesId: expect.arrayContaining([category.categoryID.id]),
        categories: expect.arrayContaining([
          {
            categoryId: category.categoryID.id,
            name: category.name,
            createdAt: category.createdAt.toISOString(),
          },
        ]),
        isActive: true,
      },
    };

    const case2 = {
      entity: faker.addCategoriesId(category.categoryID).build(),
      relations: {
        categories: [category],
      },
      sendData: {
        name: faker.name,
        categoriesId: [category.categoryID.id],
        isActive: false,
      },
      expected: {
        name: faker.name,
        categoriesId: expect.arrayContaining([category.categoryID.id]),
        categories: expect.arrayContaining([
          {
            categoryId: category.categoryID.id,
            name: category.name,
            createdAt: category.createdAt.toISOString(),
          },
        ]),
        isActive: false,
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const case3 = {
      entity: faker.addCategoriesId(category.categoryID).build(),
      relations: {
        categories: [category, ...categories],
      },
      sendData: {
        name: faker.name,
        categoriesId: [
          categories[0].categoryID.id,
          categories[1].categoryID.id,
          categories[2].categoryID.id,
        ],
      },
      expected: {
        name: faker.name,
        categoriesId: expect.arrayContaining([
          categories[0].categoryID.id,
          categories[1].categoryID.id,
          categories[2].categoryID.id,
        ]),
        categories: expect.arrayContaining([
          {
            categoryId: categories[0].categoryID.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt.toISOString(),
          },
          {
            categoryId: categories[1].categoryID.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt.toISOString(),
          },
          {
            categoryId: categories[2].categoryID.id,
            name: categories[2].name,
            createdAt: categories[2].createdAt.toISOString(),
          },
        ]),
        isActive: true,
      },
    };

    return [case1, case2, case3];
  }

  static arrangeInvalidRequest() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      CATEGORIES_ID_NOT_VALID: {
        sendData: {
          name: faker.name,
          categoriesId: ['a'],
        },
        expected: {
          message: ['each value in categoriesId must be a UUID'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      CATEGORIES_ID_NOT_EXISTS: {
        sendData: {
          name: faker.withName('action').name,
          categoriesId: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: [
            'Category Not Found using ID d8952775-5f69-42d5-9e94-00f097e1b98c',
          ],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListGenresFixture {
  static arrangeIncrementedWithCreatedAt() {
    const category = Category.fake().aCategory().build();
    const _entities = Genre.fake()
      .theGenres(4)
      .addCategoriesId(category.categoryID)
      .withName((i) => i + '')
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
    };

    const relations = {
      categories: new Map([[category.categoryID.id, category]]),
    };

    const arrange = [
      {
        sendData: {},
        expected: {
          entities: [
            entitiesMap.fourth,
            entitiesMap.third,
            entitiesMap.second,
            entitiesMap.first,
          ],
          meta: {
            currentPage: 1,
            lastPage: 1,
            perPage: 15,
            total: 4,
          },
        },
      },
      {
        sendData: {
          page: 1,
          perPage: 2,
        },
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third],
          meta: {
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
            total: 4,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
        },
        expected: {
          entities: [entitiesMap.second, entitiesMap.first],
          meta: {
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
            total: 4,
          },
        },
      },
    ];

    return { arrange, entitiesMap, relations };
  }

  static arrangeUnsorted() {
    const categories = Category.fake().theCategories(4).build();

    const relations = {
      categories: new Map(
        categories.map((category) => [category.categoryID.id, category]),
      ),
    };

    const createdAt = new Date();

    const entitiesMap = {
      test: Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .withName('test')
        .withCreatedAt(new Date(createdAt.getTime() + 1000))
        .build(),
      a: Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .withName('a')
        .withCreatedAt(new Date(createdAt.getTime() + 2000))
        .build(),
      TEST: Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .withName('TEST')
        .withCreatedAt(new Date(createdAt.getTime() + 3000))
        .build(),
      e: Genre.fake()
        .aGenre()
        .addCategoriesId(categories[3].categoryID)
        .withName('e')
        .withCreatedAt(new Date(createdAt.getTime() + 4000))
        .build(),
      TeSt: Genre.fake()
        .aGenre()
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .withName('TeSt')
        .withCreatedAt(new Date(createdAt.getTime() + 5000))
        .build(),
    };

    const arrange_filter_by_name_sort_name_asc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        get label() {
          return JSON.stringify(this.sendData);
        },
        expected: {
          entities: [entitiesMap.TEST, entitiesMap.TeSt],
          meta: {
            total: 3,
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        get label() {
          return JSON.stringify(this.sendData);
        },
        expected: {
          entities: [entitiesMap.test],
          meta: {
            total: 3,
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
    ];

    const arrange_filter_by_categories_id_and_sort_by_created_desc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'created_at',
          sortDir: 'desc' as SortDirection,
          filter: { categoriesId: [categories[0].categoryID.id] },
        },
        get label() {
          return JSON.stringify({
            ...this.sendData,
            filter: { categories_id_length: 1 },
          });
        },
        expected: {
          entities: [entitiesMap.TEST, entitiesMap.a],
          meta: {
            total: 3,
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'created_at',
          sortDir: 'desc' as SortDirection,
          filter: { categoriesId: [categories[0].categoryID.id] },
        },
        get label() {
          return JSON.stringify({
            ...this.sendData,
            filter: { categories_id_length: 1 },
          });
        },
        expected: {
          entities: [entitiesMap.test],
          meta: {
            total: 3,
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'created_at',
          sortDir: 'desc' as SortDirection,
          filter: {
            categoriesId: [
              categories[0].categoryID.id,
              categories[1].categoryID.id,
            ],
          },
        },
        get label() {
          return JSON.stringify({
            ...this.sendData,
            filter: { categories_id_length: 2 },
          });
        },
        expected: {
          entities: [entitiesMap.TeSt, entitiesMap.TEST],
          meta: {
            total: 4,
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'created_at',
          sortDir: 'desc' as SortDirection,
          filter: {
            categoriesId: [
              categories[0].categoryID.id,
              categories[1].categoryID.id,
            ],
          },
        },
        get label() {
          return JSON.stringify({
            ...this.sendData,
            filter: { categories_id_length: 2 },
          });
        },
        expected: {
          entities: [entitiesMap.a, entitiesMap.test],
          meta: {
            total: 4,
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
    ];

    return {
      arrange: [
        ...arrange_filter_by_name_sort_name_asc,
        ...arrange_filter_by_categories_id_and_sort_by_created_desc,
      ],
      entitiesMap,
      relations,
    };
  }
}

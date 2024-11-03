import { Category } from '@core/category/domain/category.aggregate';

const _keysInResponse = [
  'categoryID',
  'name',
  'description',
  'isActive',
  'createdAt',
];

export class GetCategoryFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateCategoryFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForCreate() {
    const faker = Category.fake()
      .aCategory()
      .withName('Movie')
      .withDescription('description test');
    return [
      {
        sendData: {
          name: faker.name,
        },
        expected: {
          name: faker.name,
          description: null,
          isActive: true,
        },
      },
      {
        sendData: {
          name: faker.name,
          description: faker.description,
        },
        expected: {
          name: faker.name,
          description: faker.description,
          isActive: true,
        },
      },
      {
        sendData: {
          name: faker.name,
          isActive: true,
        },
        expected: {
          name: faker.name,
          description: null,
          isActive: true,
        },
      },
      {
        sendData: {
          name: faker.name,
          isActive: false,
        },
        expected: {
          name: faker.name,
          description: null,
          isActive: false,
        },
      },
      {
        sendData: {
          name: faker.name,
          description: faker.description,
          isActive: true,
        },
        expected: {
          name: faker.name,
          description: faker.description,
          isActive: true,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      EMPTY: {
        sendData: {},
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        sendData: {
          name: undefined,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        sendData: {
          name: null,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        sendData: {
          name: '',
        },
        expected: {
          message: ['name should not be empty'],
          ...defaultExpected,
        },
      },
      DESCRIPTION_NOT_A_STRING: {
        sendData: {
          description: 5,
        },
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'description must be a string',
          ],
          ...defaultExpected,
        },
      },
      isActive_NOT_A_BOOLEAN: {
        sendData: {
          isActive: 'a',
        },
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'isActive must be a boolean value',
          ],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Category.fake().aCategory();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        sendData: {
          name: faker.withInvalidNameTooLong().name,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateCategoryFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForUpdate() {
    const faker = Category.fake()
      .aCategory()
      .withName('Movie')
      .withDescription('description test');
    return [
      {
        sendData: {
          name: faker.name,
          description: null,
          isActive: true,
        },
        expected: {
          name: faker.name,
          description: null,
          isActive: true,
        },
      },
      {
        sendData: {
          name: faker.name,
          description: faker.description,
        },
        expected: {
          name: faker.name,
          description: faker.description,
          isActive: true,
        },
      },
      {
        sendData: {
          name: faker.name,
          isActive: false,
        },
        expected: {
          name: faker.name,
          isActive: false,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      DESCRIPTION_NOT_A_STRING: {
        sendData: {
          description: 5,
        },
        expected: {
          message: ['description must be a string'],
          ...defaultExpected,
        },
      },
      IS_ACTIVE_NOT_A_BOOLEAN: {
        sendData: {
          isActive: 'a',
        },
        expected: {
          message: ['isActive must be a boolean value'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Category.fake().aCategory();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        sendData: {
          name: faker.withInvalidNameTooLong().name,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListCategoriesFixture {
  static arrangeIncrementedWithCreatedAt() {
    const _entities = Category.fake()
      .theCategories(4)
      .withName((i) => i + '')
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
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

    return { arrange, entitiesMap };
  }

  static arrangeUnsorted() {
    const faker = Category.fake().aCategory();

    const entitiesMap = {
      a: faker.withName('a').build(),
      AAA: faker.withName('AAA').build(),
      AaA: faker.withName('AaA').build(),
      b: faker.withName('b').build(),
      c: faker.withName('c').build(),
    };

    const arrange = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: 'a',
        },
        expected: {
          entities: [entitiesMap.AAA, entitiesMap.AaA],
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
          filter: 'a',
        },
        expected: {
          entities: [entitiesMap.a],
          meta: {
            total: 3,
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
    ];

    return { arrange, entitiesMap };
  }
}

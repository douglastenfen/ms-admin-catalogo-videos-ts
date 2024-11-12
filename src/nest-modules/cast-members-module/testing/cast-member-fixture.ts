import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { send } from 'process';

const _keysInResponse = ['castMemberId', 'name', 'type', 'createdAt'];

export class GetCastMemberFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForCreate() {
    const faker = CastMember.fake().anActor().withName('John Doe');

    return [
      {
        sendData: {
          name: faker.name,
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          name: faker.name,
          type: CastMemberTypes.ACTOR,
        },
      },
      {
        sendData: {
          name: faker.name,
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          name: faker.name,
          type: CastMemberTypes.DIRECTOR,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const faker = CastMember.fake().anActor().withName('John Doe');

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
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        sendData: {
          name: undefined,
          type: faker.type.type,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        sendData: {
          name: null,
          type: faker.type.type,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        sendData: {
          name: '',
          type: faker.type.type,
        },
        expected: {
          message: ['name should not be empty'],
          ...defaultExpected,
        },
      },
      TYPE_UNDEFINED: {
        sendData: {
          name: faker.name,
          type: undefined,
        },
        expected: {
          message: [
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      TYPE_NULL: {
        sendData: {
          name: faker.name,
          type: null,
        },
        expected: {
          message: [
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      TYPE_EMPTY: {
        sendData: {
          name: faker.name,
          type: '',
        },
        expected: {
          message: [
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      TYPE_NOT_A_NUMBER: {
        sendData: {
          name: faker.name,
          type: 'a',
        },
        expected: {
          message: ['type must be an integer number'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().anActor().withName('John Doe');

    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        sendData: {
          name: faker.withInvalidTooLongName().name,
          type: faker.type.type,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
      TYPE_INVALID: {
        sendData: {
          name: faker.withName('John Doe').name,
          type: 10,
        },
        expected: {
          message: ['Invalid cast member type: 10'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForUpdate() {
    const faker = CastMember.fake().anActor().withName('John Doe');

    return [
      {
        sendData: {
          name: faker.name,
          type: faker.type.type,
        },
        expected: {
          name: faker.name,
          type: faker.type.type,
        },
      },
      {
        sendData: {
          name: faker.name + 'Updated',
        },
        expected: {
          name: faker.name + 'Updated',
        },
      },
      {
        sendData: {
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          type: CastMemberTypes.DIRECTOR,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const faker = CastMember.fake().anActor().withName('John Doe');

    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      TYPE_INVALID: {
        sendData: {
          name: faker.name,
          type: 'a',
        },
        expected: {
          message: ['type must be an integer number'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().anActor().withName('John Doe');

    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      TYPE_INVALID: {
        sendData: {
          name: faker.name,
          type: 10,
        },
        expected: {
          message: ['Invalid cast member type: 10'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListCastMembersFixture {
  static arrangeIncrementedWithCreatedAt() {
    const _entities = CastMember.fake()
      .theCastMembers(4)
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
    ];

    return { arrange, entitiesMap };
  }

  static arrangeUnsorted() {
    const actor = CastMember.fake().anActor();
    const director = CastMember.fake().aDirector();

    const createdAt = new Date();

    const entitiesMap = {
      actor_a: actor
        .withName('a')
        .withCreatedAt(new Date(createdAt.getTime() + 1000))
        .build(),
      actor_AAA: actor
        .withName('AAA')
        .withCreatedAt(new Date(createdAt.getTime() + 2000))
        .build(),
      actor_AaA: actor
        .withName('AaA')
        .withCreatedAt(new Date(createdAt.getTime() + 3000))
        .build(),
      actor_b: actor
        .withName('b')
        .withCreatedAt(new Date(createdAt.getTime() + 4000))
        .build(),
      actor_c: actor
        .withName('c')
        .withCreatedAt(new Date(createdAt.getTime() + 5000))
        .build(),
      director_f: director
        .withName('f')
        .withCreatedAt(new Date(createdAt.getTime() + 6000))
        .build(),
      director_e: director
        .withName('e')
        .withCreatedAt(new Date(createdAt.getTime() + 7000))
        .build(),
    };

    const arrangeFilterByNameSortNameAsc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.actor_AAA, entitiesMap.actor_AaA],
          meta: {
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
            total: 3,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.actor_a],
          meta: {
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
            total: 3,
          },
        },
      },
    ];

    const arrangeFilterActorsSortByCreatedDesc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'createdAt',
          sortDir: 'desc' as SortDirection,
          filter: { type: CastMemberTypes.ACTOR },
        },
        expected: {
          entities: [entitiesMap.actor_c, entitiesMap.actor_b],
          meta: {
            currentPage: 1,
            lastPage: 3,
            perPage: 2,
            total: 5,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'createdAt',
          sortDir: 'desc' as SortDirection,
          filter: { type: CastMemberTypes.ACTOR },
        },
        expected: {
          entities: [entitiesMap.actor_AaA, entitiesMap.actor_AAA],
          meta: {
            currentPage: 2,
            lastPage: 3,
            perPage: 2,
            total: 5,
          },
        },
      },
    ];

    const arrangeFilterDirectorsSortByCreatedDesc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'createdAt',
          sortDir: 'desc' as SortDirection,
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        expected: {
          entities: [entitiesMap.director_e, entitiesMap.director_f],
          meta: {
            currentPage: 1,
            lastPage: 1,
            perPage: 2,
            total: 2,
          },
        },
      },
    ];

    return {
      arrange: [
        ...arrangeFilterByNameSortNameAsc,
        ...arrangeFilterActorsSortByCreatedDesc,
        ...arrangeFilterDirectorsSortByCreatedDesc,
      ],
      entitiesMap,
    };
  }
}

import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSearchResult } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { CastMemberOutputMapper } from '../../common/cast-member-output';
import { ListCastMembersUseCase } from '../list-cast-members.use-case';

describe('ListCastMembersUseCase Unit Tests', () => {
  let useCase: ListCastMembersUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new ListCastMembersUseCase(repository);
  });

  test('toOutput method', () => {
    let result = new CastMemberSearchResult({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
    });

    let output = useCase['toOutput'](result);

    expect(output).toStrictEqual({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
    });

    const castMember = CastMember.fake().anActor().build();
    result = new CastMemberSearchResult({
      items: [castMember],
      total: 1,
      currentPage: 1,
      perPage: 2,
    });

    output = useCase['toOutput'](result);

    expect(output).toStrictEqual({
      items: [castMember].map(CastMemberOutputMapper.toOutput),
      total: 1,
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
    });
  });

  it('should search sorted by createdAt when input param is empty', async () => {
    const items = [
      CastMember.fake().anActor().build(),
      CastMember.fake()
        .anActor()
        .withCreatedAt(new Date(new Date().getTime() + 100))
        .build(),
    ];

    repository.items = items;

    const output = await useCase.execute({});

    expect(output).toStrictEqual({
      items: [...items].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    });
  });

  it('should search applying paginate and filter by name', async () => {
    const createdAt = new Date();

    const castMembers = [
      CastMember.fake()
        .anActor()
        .withName('test')
        .withCreatedAt(createdAt)
        .build(),
      CastMember.fake()
        .anActor()
        .withName('a')
        .withCreatedAt(createdAt)
        .build(),
      CastMember.fake()
        .anActor()
        .withName('TEST')
        .withCreatedAt(createdAt)
        .build(),
      CastMember.fake()
        .anActor()
        .withName('TeSt')
        .withCreatedAt(createdAt)
        .build(),
    ];

    await repository.bulkInsert(castMembers);

    let output = await useCase.execute({
      page: 1,
      perPage: 2,
      filter: { name: 'TEST' },
    });

    expect(output).toStrictEqual({
      items: [castMembers[0], castMembers[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    });

    output = await useCase.execute({
      page: 2,
      perPage: 2,
      filter: { name: 'TEST' },
    });

    expect(output).toStrictEqual({
      items: [castMembers[3]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      currentPage: 2,
      perPage: 2,
      lastPage: 2,
    });
  });

  it('should search applying paginate and filter by type', async () => {
    const createdAt = new Date();

    const castMembers = [
      CastMember.fake()
        .anActor()
        .withName('actor1')
        .withCreatedAt(createdAt)
        .build(),
      CastMember.fake()
        .anActor()
        .withName('actor2')
        .withCreatedAt(createdAt)
        .build(),
      CastMember.fake()
        .anActor()
        .withName('actor3')
        .withCreatedAt(createdAt)
        .build(),
      CastMember.fake()
        .aDirector()
        .withName('director1')
        .withCreatedAt(createdAt)
        .build(),
      CastMember.fake()
        .aDirector()
        .withName('director2')
        .withCreatedAt(createdAt)
        .build(),
      CastMember.fake()
        .aDirector()
        .withName('director3')
        .withCreatedAt(createdAt)
        .build(),
    ];

    await repository.bulkInsert(castMembers);

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          filter: { type: CastMemberTypes.ACTOR },
        },
        output: {
          items: [castMembers[0], castMembers[1]].map(
            CastMemberOutputMapper.toOutput,
          ),
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
          filter: { type: CastMemberTypes.ACTOR },
        },
        output: {
          items: [castMembers[2]].map(CastMemberOutputMapper.toOutput),
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        output: {
          items: [castMembers[3], castMembers[4]].map(
            CastMemberOutputMapper.toOutput,
          ),
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    for (const item of arrange) {
      const output = await useCase.execute(item.input);

      expect(output).toStrictEqual(item.output);
    }
  });

  it('should search applying paginate and sort', async () => {
    expect(repository.sortableFields).toStrictEqual(['name', 'createdAt']);

    const castMembers = [
      CastMember.fake().anActor().withName('b').build(),
      CastMember.fake().anActor().withName('a').build(),
      CastMember.fake().anActor().withName('d').build(),
      CastMember.fake().anActor().withName('e').build(),
      CastMember.fake().anActor().withName('c').build(),
    ];

    await repository.bulkInsert(castMembers);

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
        },
        output: {
          items: [castMembers[1], castMembers[0]].map(
            CastMemberOutputMapper.toOutput,
          ),
          total: 5,
          currentPage: 1,
          perPage: 2,
          lastPage: 3,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
        },
        output: {
          items: [castMembers[4], castMembers[2]].map(
            CastMemberOutputMapper.toOutput,
          ),
          total: 5,
          currentPage: 2,
          perPage: 2,
          lastPage: 3,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc' as SortDirection,
        },
        output: {
          items: [castMembers[3], castMembers[2]].map(
            CastMemberOutputMapper.toOutput,
          ),
          total: 5,
          currentPage: 1,
          perPage: 2,
          lastPage: 3,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc' as SortDirection,
        },
        output: {
          items: [castMembers[4], castMembers[0]].map(
            CastMemberOutputMapper.toOutput,
          ),
          total: 5,
          currentPage: 2,
          perPage: 2,
          lastPage: 3,
        },
      },
    ];

    for (const item of arrange) {
      const output = await useCase.execute(item.input);

      expect(output).toStrictEqual(item.output);
    }
  });

  describe('search applying paginate, filter by name and sort', () => {
    const castMembers = [
      CastMember.fake().anActor().withName('test').build(),
      CastMember.fake().anActor().withName('a').build(),
      CastMember.fake().anActor().withName('TEST').build(),
      CastMember.fake().anActor().withName('e').build(),
      CastMember.fake().aDirector().withName('TeSt').build(),
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
          items: [castMembers[2], castMembers[4]].map(
            CastMemberOutputMapper.toOutput,
          ),
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    beforeEach(async () => {
      await repository.bulkInsert(castMembers);
    });

    test.each(arrange)(
      'when value is $searchParams',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);

        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });

  describe('search applying paginate, filter by type and sort', () => {
    const castMembers = [
      CastMember.fake().anActor().withName('test').build(),
      CastMember.fake().aDirector().withName('a').build(),
      CastMember.fake().anActor().withName('TEST').build(),
      CastMember.fake().aDirector().withName('e').build(),
      CastMember.fake().anActor().withName('TeSt').build(),
      CastMember.fake().aDirector().withName('b').build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { type: CastMemberTypes.ACTOR },
        },
        output: {
          items: [castMembers[2], castMembers[4]].map(
            CastMemberOutputMapper.toOutput,
          ),
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
          filter: { type: CastMemberTypes.ACTOR },
        },
        output: {
          items: [castMembers[0]].map(CastMemberOutputMapper.toOutput),
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        output: {
          items: [castMembers[1], castMembers[5]].map(
            CastMemberOutputMapper.toOutput,
          ),
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
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        output: {
          items: [castMembers[3]].map(CastMemberOutputMapper.toOutput),
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    beforeEach(async () => {
      await repository.bulkInsert(castMembers);
    });

    test.each(arrange)(
      'when value is $searchParams',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);

        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });

  it('should search using filter by name and type, sort and paginate', async () => {
    const castMembers = [
      CastMember.fake().anActor().withName('test').build(),
      CastMember.fake().aDirector().withName('a director').build(),
      CastMember.fake().anActor().withName('TEST').build(),
      CastMember.fake().aDirector().withName('e director').build(),
      CastMember.fake().anActor().withName('TeSt').build(),
      CastMember.fake().aDirector().withName('b director').build(),
    ];

    repository.items = castMembers;

    let output = await useCase.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      filter: { name: 'TEST', type: CastMemberTypes.ACTOR },
    });

    expect(output).toStrictEqual({
      items: [castMembers[2], castMembers[4]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    });

    output = await useCase.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      filter: { name: 'TEST', type: CastMemberTypes.ACTOR },
    });

    expect(output).toStrictEqual({
      items: [castMembers[0]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      currentPage: 2,
      perPage: 2,
      lastPage: 2,
    });

    output = await useCase.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: { name: 'director', type: CastMemberTypes.DIRECTOR },
    });

    expect(output).toStrictEqual({
      items: [castMembers[1], castMembers[5]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    });

    output = await useCase.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: { name: 'director', type: CastMemberTypes.DIRECTOR },
    });

    expect(output).toStrictEqual({
      items: [castMembers[3]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      currentPage: 2,
      perPage: 2,
      lastPage: 2,
    });
  });
});

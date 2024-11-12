import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { ListCastMembersUseCase } from '../list-cast-members.use-case';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutputMapper } from '../../common/cast-member-output';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

describe('ListCastMembersUseCase Integration Test', () => {
  let useCase: ListCastMembersUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListCastMembersUseCase(repository);
  });

  it('should return output sorted by createdAt when input param is empty', async () => {
    const castMembers = CastMember.fake()
      .theCastMembers(2)
      .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
      .build();

    await repository.bulkInsert(castMembers);

    const output = await useCase.execute({});

    expect(output).toEqual({
      items: [...castMembers].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    });
  });

  describe('search applying filter by name, sort and paginate', () => {
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
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [castMembers[0]].map(CastMemberOutputMapper.toOutput),
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

  describe('search applying filter by type, sort and paginate', () => {
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

    await repository.bulkInsert(castMembers);

    let output = await useCase.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      filter: { name: 'TEST', type: CastMemberTypes.ACTOR },
    });

    expect(output).toEqual({
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

    expect(output).toEqual({
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

    expect(output).toEqual({
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

    expect(output).toEqual({
      items: [castMembers[3]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      currentPage: 2,
      perPage: 2,
      lastPage: 2,
    });
  });
});

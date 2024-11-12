import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '@core/cast-member/domain/cast-member.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { CastMemberSequelizeRepository } from '../cast-member-sequelize.repository';
import { CastMemberModel } from '../cast-member.model';
import { CastMemberModelMapper } from '../cast-member.model.mapper';

describe('CastMemberRepository Integration Test', () => {
  setupSequelize({ models: [CastMemberModel] });

  let repository: CastMemberSequelizeRepository;

  beforeEach(async () => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  it('should insert a new cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    await repository.insert(castMember);

    const castMemberFound = await repository.findByID(castMember.castMemberId);

    expect(castMemberFound.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should find a cast member by id', async () => {
    let castMemberFound = await repository.findByID(new CastMemberId());
    expect(castMemberFound).toBeNull();

    const castMember = CastMember.fake().anActor().build();

    await repository.insert(castMember);

    castMemberFound = await repository.findByID(castMember.castMemberId);

    expect(castMemberFound.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should return all cast members', async () => {
    const castMembers = CastMember.fake().theCastMembers(3).build();

    await repository.bulkInsert(castMembers);

    const castMembersFound = await repository.findAll();

    expect(castMembersFound).toHaveLength(3);

    expect(JSON.stringify(castMembers)).toStrictEqual(
      JSON.stringify(castMembersFound),
    );
  });

  it('should throw an error on update when cast member does not exist', async () => {
    const castMember = CastMember.fake().anActor().build();

    await expect(repository.update(castMember)).rejects.toThrow(
      new NotFoundError(castMember.castMemberId.id, CastMember),
    );
  });

  it('should update a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    await repository.insert(castMember);

    castMember.changeName('New Name');
    castMember.changeType(CastMemberType.createDirector());

    await repository.update(castMember);

    const castMemberFound = await repository.findByID(castMember.castMemberId);

    expect(castMemberFound.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should throw an error on delete when cast member does not exist', async () => {
    const castMemberId = new CastMemberId();

    await expect(repository.delete(castMemberId)).rejects.toThrow(
      new NotFoundError(castMemberId.id, CastMember),
    );
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    await repository.insert(castMember);

    await repository.delete(castMember.castMemberId);

    const castMemberFound = await repository.findByID(castMember.castMemberId);

    expect(castMemberFound).toBeNull();
  });

  describe('search methods', () => {
    it('should only apply paginate when other params are null', async () => {
      const createdAt = new Date();
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withName('John Doe')
        .withType(CastMemberType.createDirector())
        .withCreatedAt(createdAt)
        .build();

      await repository.bulkInsert(castMembers);

      const spyToEntity = jest.spyOn(CastMemberModelMapper, 'toEntity');

      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );

      expect(searchOutput).toBeInstanceOf(CastMemberSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });

      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(CastMember);
        expect(item.castMemberId).toBeDefined();
      });

      const items = searchOutput.items.map((item) => item.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'John Doe',
          type: CastMemberTypes.DIRECTOR,
          createdAt,
        }),
      );
    });

    it('should order by createdAt DESC when search params are null', async () => {
      const createdAt = new Date();
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withName((index) => `John Doe ${index}`)
        .withType(CastMemberType.createDirector())
        .withCreatedAt((index) => new Date(createdAt.getTime() + index))
        .build();

      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );

      const items = searchOutput.items;

      [...items].reverse().forEach((item, index) => {
        expect(`John Doe ${index}`).toBe(`${castMembers[index].name}`);
      });
    });

    it('should apply paginate and filter', async () => {
      const castMembers = [
        CastMember.fake()
          .anActor()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        CastMember.fake()
          .anActor()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        CastMember.fake()
          .anActor()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        CastMember.fake()
          .anActor()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];

      await repository.bulkInsert(castMembers);

      let searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 1,
          perPage: 2,
          filter: { name: 'TEST' },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[0], castMembers[2]],
          total: 3,
          currentPage: 1,
          perPage: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 2,
          perPage: 2,
          filter: { name: 'TEST' },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[3]],
          total: 3,
          currentPage: 2,
          perPage: 2,
        }).toJSON(true),
      );
    });

    it('should apply paginate and sort', async () => {
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
          params: CastMemberSearchParams.create({
            page: 1,
            perPage: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[1], castMembers[0]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            perPage: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[4], castMembers[2]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[3], castMembers[2]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[4], castMembers[0]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await repository.search(i.params);

        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const castMembers = [
        CastMember.fake().anActor().withName('test').build(),
        CastMember.fake().anActor().withName('a').build(),
        CastMember.fake().anActor().withName('TEST').build(),
        CastMember.fake().anActor().withName('e').build(),
        CastMember.fake().aDirector().withName('TeSt').build(),
      ];

      const arrange = [
        {
          params: CastMemberSearchParams.create({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[2], castMembers[4]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(castMembers);
      });

      test.each(arrange)(
        'when value is %$searchParams',
        async ({ params, result }) => {
          const searchOutput = await repository.search(params);
          expect(searchOutput.toJSON(true)).toMatchObject(result.toJSON(true));
        },
      );
    });
  });
});

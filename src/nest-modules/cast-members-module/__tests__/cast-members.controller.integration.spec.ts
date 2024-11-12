import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { CreateCastMemberUseCase } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { GetCastMemberUseCase } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersUseCase } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { UpdateCastMemberUseCase } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { CastMembersController } from '../cast-members.controller';
import { CastMembersModule } from '../cast-members.module';
import { CastMemberCollectionPresenter } from '../cast-members.presenter';
import { CAST_MEMBER_PROVIDERS } from '../cast-members.provider';
import {
  CreateCastMemberFixture,
  ListCastMembersFixture,
  UpdateCastMemberFixture,
} from '../testing/cast-member-fixture';

describe('CastMembersController Integration Tests', () => {
  let controller: CastMembersController;
  let repository: ICastMemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CastMembersModule],
    }).compile();

    controller = module.get(CastMembersController);

    repository = module.get(
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createCastMemberUseCase']).toBeInstanceOf(
      CreateCastMemberUseCase,
    );
    expect(controller['updateCastMemberUseCase']).toBeInstanceOf(
      UpdateCastMemberUseCase,
    );
    expect(controller['listCastMembersUseCase']).toBeInstanceOf(
      ListCastMembersUseCase,
    );
    expect(controller['getCastMemberUseCase']).toBeInstanceOf(
      GetCastMemberUseCase,
    );
    expect(controller['deleteCastMemberUseCase']).toBeInstanceOf(
      DeleteCastMemberUseCase,
    );
  });

  describe('create a cast member', () => {
    const arrange = CreateCastMemberFixture.arrangeForCreate();

    test.each(arrange)(
      'when body is $sendData',
      async ({ sendData, expected }) => {
        const presenter = await controller.create(sendData);

        const entity = await repository.findByID(
          new CastMemberId(presenter.castMemberId),
        );

        expect(entity!.toJSON()).toStrictEqual({
          castMemberId: presenter.castMemberId,
          createdAt: presenter.createdAt,
          ...expected,
        });

        expect(presenter).toEqual(
          CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(entity!),
          ),
        );
      },
    );
  });

  describe('update a cast member', () => {
    const arrange = UpdateCastMemberFixture.arrangeForUpdate();

    const castMember = CastMember.fake().anActor().build();

    beforeEach(async () => {
      await repository.insert(castMember);
    });

    test.each(arrange)(
      'with request $sendData',
      async ({ sendData, expected }) => {
        const presenter = await controller.update(
          castMember.castMemberId.id,
          sendData,
        );

        const entity = await repository.findByID(
          new CastMemberId(presenter.castMemberId),
        );

        expect(entity!.toJSON()).toStrictEqual({
          castMemberId: presenter.castMemberId,
          createdAt: presenter.createdAt,
          name: expected.name ?? castMember.name,
          type: expected.type ?? castMember.type.type,
        });

        expect(presenter).toEqual(
          CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(entity!),
          ),
        );
      },
    );
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    await repository.insert(castMember);

    const response = await controller.remove(castMember.castMemberId.id);

    expect(response).toBeUndefined();

    await expect(
      repository.findByID(castMember.castMemberId),
    ).resolves.toBeNull();
  });

  it('should get a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    await repository.insert(castMember);

    const presenter = await controller.findOne(castMember.castMemberId.id);

    expect(presenter.castMemberId).toBe(castMember.castMemberId.id);
    expect(presenter.name).toBe(castMember.name);
    expect(presenter.type).toBe(castMember.type.type);
    expect(presenter.createdAt).toEqual(castMember.createdAt);
  });

  describe('search method', () => {
    describe('return cast member using query empty ordered by createdAt', () => {
      const { entitiesMap, arrange } =
        ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);

          const { entities, ...paginationProps } = expected;

          expect(presenter).toEqual(
            new CastMemberCollectionPresenter({
              items: entities.map(CastMemberOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('return output using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is {"filter": $sendData.filter, "page": $sendData.page, "perPage": $sendData.perPage, "sort": $sendData.sort, "sortDir": $sendData.sortDir}',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);

          const { entities, ...paginationProps } = expected;

          expect(presenter).toEqual(
            new CastMemberCollectionPresenter({
              items: entities.map(CastMemberOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });
  });
});

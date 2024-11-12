import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import qs from 'qs';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.provider';
import { ListCastMembersFixture } from 'src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members (GET)', () => {
    describe('return cast members sorted by createdAt when request query is empty', () => {
      let castMemberRepository: ICastMemberRepository;

      const nestApp = startApp();

      const { entitiesMap, arrange } =
        ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        castMemberRepository = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );

        await castMemberRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query param is $sendData',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();

          return request(nestApp.app.getHttpServer())
            .get(`/cast-members?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((entity) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(entity),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('return cast members using paginate, filter and sort', () => {
      let castMemberRepository: ICastMemberRepository;

      const nestApp = startApp();

      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        castMemberRepository = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );

        await castMemberRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each([arrange[0]])(
        'when query param is $sendData',
        async ({ sendData, expected }) => {
          const queryParams = qs.stringify(sendData as any).toString();

          return request(nestApp.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((entity) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(entity),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});

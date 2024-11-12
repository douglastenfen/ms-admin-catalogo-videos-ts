import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.provider';
import { GetCastMemberFixture } from 'src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  const nestApp = startApp();

  describe('/cast-members/:id (GET)', () => {
    describe('when cast member id is invalid or does not exist', () => {
      const arrange = [
        {
          castMemberId: '123e4567-e89b-12d3-a456-426614174000',
          expected: {
            message:
              'CastMember Not Found using ID 123e4567-e89b-12d3-a456-426614174000',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          castMemberId: 'fake id',
          expected: {
            message: 'Validation failed (uuid is expected)',
            statusCode: 422,
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $castMemberId',
        async ({ castMemberId, expected }) => {
          return request(nestApp.app.getHttpServer())
            .get(`/cast-members/${castMemberId}`)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    it('should return a cast member', async () => {
      const castMemberRepository = nestApp.app.get<ICastMemberRepository>(
        CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );

      const castMember = CastMember.fake().anActor().build();
      await castMemberRepository.insert(castMember);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/cast-members/${castMember.castMemberId.id}`)
        .expect(200);

      const keysInResponse = GetCastMemberFixture.keysInResponse;

      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

      const presenter = CastMembersController.serialize(
        CastMemberOutputMapper.toOutput(castMember),
      );

      const serialized = instanceToPlain(presenter);

      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});

import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CAST_MEMBER_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.provider';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members/:id (DELETE)', () => {
    const nestApp = startApp();

    describe('return an error when id is invalid or not found', () => {
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
          castMemberId: 'invalid-id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $castMemberId',
        async ({ castMemberId, expected }) => {
          return request(nestApp.app.getHttpServer())
            .delete(`/cast-members/${castMemberId}`)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    it('should delete a cast member response with status 204', async () => {
      const castMemberRepository = nestApp.app.get<ICastMemberRepository>(
        CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );

      const castMember = CastMember.fake().anActor().build();
      await castMemberRepository.insert(castMember);

      await request(nestApp.app.getHttpServer())
        .delete(`/cast-members/${castMember.castMemberId.id}`)
        .expect(204);

      await expect(
        castMemberRepository.findByID(castMember.castMemberId),
      ).resolves.toBeNull();
    });
  });
});

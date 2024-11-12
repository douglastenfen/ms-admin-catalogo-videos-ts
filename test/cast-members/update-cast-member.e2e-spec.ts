import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.provider';
import {
  GetCastMemberFixture,
  UpdateCastMemberFixture,
} from 'src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMemberController (e2e)', () => {
  const castMemberId = '123e4567-e89b-12d3-a456-426614174000';

  describe('/cast-members/:id (PATCH)', () => {
    describe('return error when id is invalid or not found', () => {
      const nestApp = startApp();

      const faker = CastMember.fake().anActor();

      const arrange = [
        {
          castMemberId: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          sendData: { name: faker.name },
          expected: {
            message:
              'CastMember Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          castMemberId: 'fake-id',
          sendData: { name: faker.name },
          expected: {
            message: 'Validation failed (uuid is expected)',
            statusCode: 422,
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $castMemberId',
        async ({ castMemberId, sendData, expected }) => {
          return request(nestApp.app.getHttpServer())
            .patch(`/cast-members/${castMemberId}`)
            .send(sendData)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('return error 422 when request body is invalid', () => {
      const app = startApp();

      const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();

      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .patch(`/cast-members/${castMemberId}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('return error 422 when throw EntityValidationError', () => {
      const app = startApp();

      const valiationError =
        UpdateCastMemberFixture.arrangeForEntityValidationError();

      const arrange = Object.keys(valiationError).map((key) => ({
        label: key,
        value: valiationError[key],
      }));

      let castMemberRepository: ICastMemberRepository;

      beforeEach(() => {
        castMemberRepository = app.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body is $label', async ({ value }) => {
        const castMember = CastMember.fake().anActor().build();

        await castMemberRepository.insert(castMember);

        return request(app.app.getHttpServer())
          .patch(`/cast-members/${castMember.castMemberId.id}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('update a cast member', () => {
      const app = startApp();

      const arrange = UpdateCastMemberFixture.arrangeForUpdate();

      let castMemberRepository: ICastMemberRepository;

      beforeEach(() => {
        castMemberRepository = app.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const castMemberCreated = CastMember.fake().anActor().build();

          await castMemberRepository.insert(castMemberCreated);

          const res = await request(app.app.getHttpServer())
            .patch(`/cast-members/${castMemberCreated.castMemberId.id}`)
            .send(sendData)
            .expect(200);

          const keysInResponse = GetCastMemberFixture.keysInResponse;

          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const id = res.body.data.castMemberId;

          const castMemberUpdated = await castMemberRepository.findByID(
            new CastMemberId(id),
          );

          const presenter = CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(castMemberUpdated!),
          );

          const serialized = instanceToPlain(presenter);

          expect(res.body.data).toStrictEqual(serialized);

          expect(res.body.data).toStrictEqual({
            castMemberId: serialized.castMemberId,
            createdAt: serialized.createdAt,
            name: expected.name ?? castMemberCreated.name,
            type: expected.type ?? castMemberCreated.type.type,
          });
        },
      );
    });
  });
});

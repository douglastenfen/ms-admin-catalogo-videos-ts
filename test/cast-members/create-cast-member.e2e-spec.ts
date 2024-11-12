import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.provider';
import { CreateCastMemberFixture } from 'src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members (POST)', () => {
    describe('when body is invalid', () => {
      const appHelper = startApp();

      const invalidRequest = CreateCastMemberFixture.arrangeInvalidRequest();

      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/cast-members')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('when throw an EntityValidationError', () => {
      const appHelper = startApp();
      const validationError =
        CreateCastMemberFixture.arrangeForEntityValidationError();

      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/cast-members')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('when create a cast member', () => {
      const app = startApp();

      const arrange = CreateCastMemberFixture.arrangeForCreate();

      let castMemberRepository: ICastMemberRepository;

      beforeEach(async () => {
        castMemberRepository = app.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const res = await request(app.app.getHttpServer())
            .post('/cast-members')
            .send(sendData)
            .expect(201);

          const keyInResponse = CreateCastMemberFixture.keysInResponse;

          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

          const castMemberId = res.body.data.castMemberId;

          const castMemberCreated = await castMemberRepository.findByID(
            new CastMemberId(castMemberId),
          );

          const presenter = CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(castMemberCreated),
          );

          const serialized = instanceToPlain(presenter);

          expect(res.body.data).toStrictEqual({
            castMemberId: serialized.castMemberId,
            createdAt: serialized.createdAt,
            ...expected,
          });
        },
      );
    });
  });
});

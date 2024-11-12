import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.provider';
import { CreateCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let categoryRepository: ICategoryRepository;

  beforeEach(async () => {
    categoryRepository = appHelper.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/categories (POST)', () => {
    describe('when body is invalid', () => {
      const invalidRequest = CreateCategoryFixture.arrangeInvalidRequest();

      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('when throw an EntityValidationError', () => {
      const invalidRequest =
        CreateCategoryFixture.arrangeForEntityValidationError();

      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('when create a category', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .post('/categories')
            .send(sendData)
            .expect(201);

          const keysInResponse = CreateCategoryFixture.keysInResponse;

          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const { categoryID } = res.body.data;

          const categoryCreated = await categoryRepository.findByID(
            new Uuid(categoryID),
          );

          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryCreated!),
          );

          const serialized = instanceToPlain(presenter);

          expect(res.body.data).toStrictEqual({
            categoryID: serialized.categoryID,
            createdAt: serialized.createdAt,
            ...expected,
          });
        },
      );
    });
  });
});

import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.provider';
import { UpdateCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('/categories/:id (PATCH)', () => {
    describe('return error when category is invalid or does not exist', () => {
      const appHelper = startApp();

      const faker = Category.fake().aCategory();

      const arrange = [
        {
          categoryID: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          sendData: { name: faker.name },
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          categoryID: 'fake-id',
          sendData: { name: faker.name },
          expected: {
            message: 'Validation failed (uuid is expected)',
            statusCode: 422,
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $categoryID',
        async ({ categoryID, sendData, expected }) => {
          return request(appHelper.app.getHttpServer())
            .patch(`/categories/${categoryID}`)
            .authenticate(appHelper.app)
            .send(sendData)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('return status 422 when body is invalid', () => {
      const appHelper = startApp();

      const invalidRequest = UpdateCategoryFixture.arrangeInvalidRequest();

      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/categories/${uuid}`)
          .authenticate(appHelper.app)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('response with 422 when throw an EntityValidationError', () => {
      const appHelper = startApp();

      const validationError =
        UpdateCategoryFixture.arrangeForEntityValidationError();

      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));

      let categoryRepository: ICategoryRepository;

      beforeEach(() => {
        categoryRepository = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().aCategory().build();

        await categoryRepository.insert(category);

        return request(appHelper.app.getHttpServer())
          .patch(`/categories/${category.categoryID.id}`)
          .authenticate(appHelper.app)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('update category and return 200', () => {
      const appHelper = startApp();

      const arrange = UpdateCategoryFixture.arrangeForUpdate();

      let categoryRepository: ICategoryRepository;

      beforeEach(async () => {
        categoryRepository = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const category = Category.fake().aCategory().build();

          await categoryRepository.insert(category);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/categories/${category.categoryID.id}`)
            .authenticate(appHelper.app)
            .send(sendData)
            .expect(200);

          const keysInResponse = UpdateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const id = res.body.data.categoryID;

          const categoryUpdated = await categoryRepository.findByID(
            new Uuid(id),
          );

          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryUpdated!),
          );

          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual(serialized);
          expect(res.body.data).toStrictEqual({
            categoryID: serialized.categoryID,
            createdAt: serialized.createdAt,
            name: expected.name ?? categoryUpdated!.name,
            description:
              'description' in expected
                ? expected.description
                : categoryUpdated!.description,
            isActive: expected.isActive ?? categoryUpdated!.isActive,
          });
        },
      );
    });
  });
});

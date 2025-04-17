import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import * as CategoryProviders from 'src/nest-modules/categories-module/categories.provider';
import { GetCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();

  describe('/categories/:id (GET)', () => {
    describe('when category does not exist', () => {
      const arrange = [
        {
          categoryID: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          categoryID: 'fake-id',
          expected: {
            message: 'Validation failed (uuid is expected)',
            statusCode: 422,
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $categoryID',
        ({ categoryID, expected }) => {
          return request(appHelper.app.getHttpServer())
            .get(`/categories/${categoryID}`)
            .authenticate(appHelper.app)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    it('should return category and return 200', async () => {
      const categoryRepository = appHelper.app.get<ICategoryRepository>(
        CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );

      const category = Category.fake().aCategory().build();

      await categoryRepository.insert(category);

      const res = await request(appHelper.app.getHttpServer())
        .get(`/categories/${category.categoryID.id}`)
        .authenticate(appHelper.app)
        .expect(200);

      const keysInResponse = GetCategoryFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

      const presenter = CategoriesController.serialize(
        CategoryOutputMapper.toOutput(category),
      );

      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});

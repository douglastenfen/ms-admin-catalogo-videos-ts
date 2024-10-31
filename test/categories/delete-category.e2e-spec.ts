import { Category } from '@core/category/domain/category.entity';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import * as CategoryProviders from 'src/nest-modules/categories-module/categories.provider';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  describe('/categories/:id (DELETE)', () => {
    const appHelper = startApp();

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
            .delete(`/categories/${categoryID}`)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    it('should delete category and return 204', async () => {
      const categoryRepository = appHelper.app.get<ICategoryRepository>(
        CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );

      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      await request(appHelper.app.getHttpServer())
        .delete(`/categories/${category.categoryID}`)
        .expect(204);

      await expect(
        categoryRepository.findByID(category.categoryID),
      ).resolves.toBeNull();
    });
  });
});

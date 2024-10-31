import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import * as CategoryProviders from 'src/nest-modules/categories-module/categories.provider';
import { ListCategoriesFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  describe('/categories (GET)', () => {
    describe('when request query is empty', () => {
      let categoryRepository: ICategoryRepository;

      const appHelper = startApp();

      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        categoryRepository = appHelper.app.get<ICategoryRepository>(
          CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );

        await categoryRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $sendData',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();

          return request(appHelper.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('return categories using pagination, filter and sort', () => {
      let categoryRepository: ICategoryRepository;

      const appHelper = startApp();

      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        categoryRepository = appHelper.app.get<ICategoryRepository>(
          CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );

        await categoryRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $sendData',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();

          return request(appHelper.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
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

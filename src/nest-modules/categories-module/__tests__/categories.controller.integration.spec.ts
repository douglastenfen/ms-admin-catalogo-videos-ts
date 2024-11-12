import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.use-case';
import { GetCategoryUseCase } from '@core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { CategoriesController } from '../categories.controller';
import { CategoriesModule } from '../categories.module';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from '../categories.presenter';
import { CATEGORY_PROVIDERS } from '../categories.provider';
import {
  CreateCategoryFixture,
  ListCategoriesFixture,
  UpdateCategoryFixture,
} from '../testing/category-fixture';

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    repository = module.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();

    expect(controller['createCategoryUseCase']).toBeInstanceOf(
      CreateCategoryUseCase,
    );
    expect(controller['getCategoryUseCase']).toBeInstanceOf(GetCategoryUseCase);
    expect(controller['listCategoriesUseCase']).toBeInstanceOf(
      ListCategoriesUseCase,
    );
    expect(controller['updateCategoryUseCase']).toBeInstanceOf(
      UpdateCategoryUseCase,
    );
    expect(controller['deleteCategoryUseCase']).toBeInstanceOf(
      DeleteCategoryUseCase,
    );
  });

  describe('create a category', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();

    test.each(arrange)(
      'when body is %sendData',
      async ({ sendData, expected }) => {
        const presenter = await controller.create(sendData);

        const entity = await repository.findByID(
          new Uuid(presenter.categoryID),
        );

        expect(entity!.toJSON()).toStrictEqual({
          categoryID: presenter.categoryID,
          createdAt: presenter.createdAt,
          ...expected,
        });

        const output = CategoryOutputMapper.toOutput(entity!);

        expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  describe('update a category', () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();

    const category = Category.fake().aCategory().build();

    beforeEach(async () => {
      await repository.insert(category);
    });

    test.each(arrange)(
      'when body is %sendData',
      async ({ sendData, expected }) => {
        const presenter = await controller.update(
          category.categoryID.id,
          sendData,
        );

        const entity = await repository.findByID(
          new Uuid(presenter.categoryID),
        );

        expect(entity!.toJSON()).toStrictEqual({
          categoryID: presenter.categoryID,
          createdAt: presenter.createdAt,
          name: expected.name ?? category.name,
          description:
            'description' in expected
              ? expected.description
              : category.description,
          isActive:
            expected.isActive === true || expected.isActive === false
              ? expected.isActive
              : category.isActive,
        });

        const output = CategoryOutputMapper.toOutput(entity!);
        expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();

    await repository.insert(category);

    const response = await controller.remove(category.categoryID.id);
    expect(response).toBeUndefined();

    await expect(repository.findByID(category.categoryID)).resolves.toBeNull();
  });

  it('should get a category', async () => {
    const category = Category.fake().aCategory().build();

    await repository.insert(category);

    const presenter = await controller.findOne(category.categoryID.id);

    expect(presenter.categoryID).toBe(category.categoryID.id);
    expect(presenter.name).toBe(category.name);
    expect(presenter.description).toBe(category.description);
    expect(presenter.isActive).toBe(category.isActive);
    expect(presenter.createdAt).toStrictEqual(category.createdAt);
  });

  describe('search categories', () => {
    describe('sort by createdAt', () => {
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is %sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);

          const { entities, ...paginationProps } = expected;

          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is %sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);

          const { entities, ...paginationProps } = expected;

          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });
  });
});

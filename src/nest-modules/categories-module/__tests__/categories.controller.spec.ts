import { CreateCategoryOutput } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { GetCategoryOutput } from '@core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesOutput } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { UpdateCategoryInput } from '@core/category/application/use-cases/update-category/update-category.input';
import { UpdateCategoryOutput } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { CategoriesController } from '../categories.controller';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from '../categories.presenter';
import { CreateCategoryDto } from '../dto/create-category.dto';

describe('CategoriesController Unit Tests', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    controller = new CategoriesController();
  });

  it('should create a category', async () => {
    const output: CreateCategoryOutput = {
      categoryID: '9366f7e8-5c6b-4d5e-8c9b-0b242d2b4b0e',
      name: 'Movie',
      description: 'Movies category',
      isActive: true,
      createdAt: new Date(),
    };

    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    // @ts-expect-error defining part of methods
    controller['createCategoryUseCase'] = mockCreateUseCase;

    const input: CreateCategoryDto = {
      name: 'Movie',
      description: 'Movies category',
      isActive: true,
    };

    const presenter = await controller.create(input);

    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);

    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should update a category', async () => {
    const categoryID = '9366f7e8-5c6b-4d5e-8c9b-0b242d2b4b0e';

    const output: UpdateCategoryOutput = {
      categoryID,
      name: 'Movie',
      description: 'Movies category',
      isActive: true,
      createdAt: new Date(),
    };

    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    // @ts-expect-error defining part of methods
    controller['updateCategoryUseCase'] = mockUpdateUseCase;

    const input: Omit<UpdateCategoryInput, 'categoryID'> = {
      name: 'Movie',
      description: 'Movies category',
      isActive: true,
    };

    const presenter = await controller.update(categoryID, input);

    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
      categoryID,
      ...input,
    });

    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should delete a category', async () => {
    const expectedOutput = undefined;

    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };

    // @ts-expect-error defining part of methods
    controller['deleteCategoryUseCase'] = mockDeleteUseCase;

    const categoryID = '9366f7e8-5c6b-4d5e-8c9b-0b242d2b4b0e';

    expect(controller.remove(categoryID)).toBeInstanceOf(Promise);

    const output = await controller.remove(categoryID);

    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ categoryID });
    expect(output).toStrictEqual(expectedOutput);
  });

  it('should get a category', async () => {
    const categoryID = '9366f7e8-5c6b-4d5e-8c9b-0b242d2b4b0e';

    const output: GetCategoryOutput = {
      categoryID,
      name: 'Movie',
      description: 'Movies category',
      isActive: true,
      createdAt: new Date(),
    };

    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    // @ts-expect-error defining part of methods
    controller['getCategoryUseCase'] = mockGetUseCase;

    const presenter = await controller.findOne(categoryID);

    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ categoryID });

    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should list categories', async () => {
    const output: ListCategoriesOutput = {
      items: [
        {
          categoryID: '9366f7e8-5c6b-4d5e-8c9b-0b242d2b4b0e',
          name: 'Movie',
          description: 'Movies category',
          isActive: true,
          createdAt: new Date(),
        },
      ],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    };

    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    // @ts-expect-error defining part of methods
    controller['listCategoriesUseCase'] = mockListUseCase;

    const searchParams = {
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'desc' as SortDirection,
      filter: 'test',
    };

    const presenter = await controller.search(searchParams);

    expect(presenter).toBeInstanceOf(CategoryCollectionPresenter);
    expect(presenter).toEqual(new CategoryCollectionPresenter(output));

    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
  });
});

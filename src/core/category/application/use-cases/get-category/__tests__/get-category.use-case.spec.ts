import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import {
  InvalidUUIDError
} from '../../../../../shared/domain/value-objects/uuid.vo';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { GetCategoryUseCase } from '../get-category.use-case';

describe('GetCategoryUseCase Unit Test', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throw an error if category does not exist', async () => {
    await expect(() =>
      useCase.execute({ categoryID: 'fake-id' }),
    ).rejects.toThrow(new InvalidUUIDError());

    const categoryId = new CategoryId();

    await expect(() =>
      useCase.execute({ categoryID: categoryId.id }),
    ).rejects.toThrow(new NotFoundError(categoryId.id, Category));
  });

  it('should return a category', async () => {
    const category = Category.create({ name: 'Movie' });

    repository.items = [category];

    const spyFindByID = jest.spyOn(repository, 'findByID');

    const result = await useCase.execute({
      categoryID: category.categoryID.id,
    });

    expect(spyFindByID).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({
      categoryID: category.categoryID.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    });
  });
});

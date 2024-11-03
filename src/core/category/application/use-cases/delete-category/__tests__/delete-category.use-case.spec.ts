import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { InvalidUUIDError } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('DeleteCategoryUseCase Unit Test', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
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

  it('should delete a category', async () => {
    const spyDelete = jest.spyOn(repository, 'delete');

    const category = Category.create({ name: 'Movie' });

    repository.items = [category];

    await useCase.execute({ categoryID: category.categoryID.id });

    expect(spyDelete).toHaveBeenCalledTimes(1);
    expect(repository.items).toHaveLength(0);
  });
});

import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { InvalidUUIDError, Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../../domain/category.entity";
import { CategoryInMemoryRepository } from "../../../../infra/db/in-memory/category-in-memory.repository";
import { DeleteCategoryUseCase } from "../../delete-category.use-case";

describe('DeleteCategoryUseCase Unit Test', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throw an error if category does not exist', async () => {
    await expect(() =>
      useCase.execute({ categoryID: 'fake-id' })
    ).rejects.toThrow(new InvalidUUIDError());

    const uuid = new Uuid();

    await expect(() =>
      useCase.execute({ categoryID: uuid.id })
    ).rejects.toThrow(new NotFoundError(uuid.id, Category));
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

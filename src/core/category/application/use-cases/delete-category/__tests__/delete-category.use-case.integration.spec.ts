import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/testing/sequelize-helper";
import { Category } from "../../../../domain/category.entity";
import { CategorySequelizeRepository } from "../../../../infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "../../../../infra/db/sequelize/category.model";
import { DeleteCategoryUseCase } from "../delete-category.use-case";

describe('DeleteCategoryUseCase Integration Test', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should trhow an error if category does not exist', async () => {
    const uuid = new Uuid();

    await expect(() =>
      useCase.execute({ categoryID: uuid.id })
    ).rejects.toThrow(new NotFoundError(uuid.id, Category));
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();

    repository.insert(category);

    await useCase.execute({ categoryID: category.categoryID.id });

    await expect(repository.findByID(category.categoryID)).resolves.toBeNull();
  });
});

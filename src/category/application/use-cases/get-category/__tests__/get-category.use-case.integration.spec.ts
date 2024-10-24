import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/testing/sequelize-helper";
import { Category } from "../../../../domain/category.entity";
import { CategorySequelizeRepository } from "../../../../infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "../../../../infra/db/sequelize/category.model";
import { GetCategoryUseCase } from "../../get-category/get-category.use-case";

describe('GetCategoryUseCase Integration Test', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throw an error if category does not exist', async () => {
    const uuid = new Uuid();

    await expect(() =>
      useCase.execute({ categoryID: uuid.id })
    ).rejects.toThrow(new NotFoundError(uuid.id, Category));
  });

  it('should return a category', async () => {
    const category = Category.fake().aCategory().build();

    repository.insert(category);

    const result = await useCase.execute({
      categoryID: category.categoryID.id,
    });

    expect(result).toStrictEqual({
      categoryID: category.categoryID.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    });
  });
});

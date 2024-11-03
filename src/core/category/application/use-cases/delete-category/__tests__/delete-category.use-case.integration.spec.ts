import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize-helper';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import { CategorySequelizeRepository } from '../../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('DeleteCategoryUseCase Integration Test', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should trhow an error if category does not exist', async () => {
    const categoryId = new CategoryId();

    await expect(() =>
      useCase.execute({ categoryID: categoryId.id }),
    ).rejects.toThrow(new NotFoundError(categoryId.id, Category));
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();

    await repository.insert(category);

    await useCase.execute({ categoryID: category.categoryID.id });

    await expect(repository.findByID(category.categoryID)).resolves.toBeNull();
  });
});

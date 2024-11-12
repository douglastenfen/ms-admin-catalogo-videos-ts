import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize-helper';
import { CategorySequelizeRepository } from '../../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { CreateCategoryUseCase } from '../create-category.use-case';

describe('CreateCategoryUseCase Integration Test', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should create a category', async () => {
    let output = await useCase.execute({ name: 'test' });
    let entity = await repository.findByID(new Uuid(output.categoryID));

    expect(output).toStrictEqual({
      categoryID: entity!.categoryID.id,
      name: 'test',
      description: null,
      isActive: true,
      createdAt: entity!.createdAt,
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
    });

    entity = await repository.findByID(new Uuid(output.categoryID));

    expect(output).toStrictEqual({
      categoryID: entity!.categoryID.id,
      name: 'test',
      description: 'some description',
      isActive: true,
      createdAt: entity!.createdAt,
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      isActive: false,
    });

    entity = await repository.findByID(new Uuid(output.categoryID));

    expect(output).toStrictEqual({
      categoryID: entity!.categoryID.id,
      name: 'test',
      description: 'some description',
      isActive: false,
      createdAt: entity!.createdAt,
    });
  });
});

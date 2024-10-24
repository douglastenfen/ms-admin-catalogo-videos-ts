import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/testing/sequelize-helper";
import { Category } from "../../../../domain/category.entity";
import { CategorySequelizeRepository } from "../../../../infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "../../../../infra/db/sequelize/category.model";
import { UpdateCategoryUseCase } from "../update-category.use-case";

describe('UpdateCategoryUseCase Integration Test', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should trhow an error if category does not exist', async () => {
    const uuid = new Uuid();

    await expect(() =>
      useCase.execute({ categoryID: uuid.id, name: 'fake' })
    ).rejects.toThrow(new NotFoundError(uuid.id, Category));
  });

  it('should create a category', async () => {
    const category = Category.fake().aCategory().build();

    repository.insert(category);

    let output = await useCase.execute({
      categoryID: category.categoryID.id,
      name: 'test',
    });

    expect(output).toStrictEqual({
      categoryID: category.categoryID.id,
      name: 'test',
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    });

    type Arrange = {
      input: {
        categoryID: string;
        name: string;
        description?: string | null;
        isActive?: boolean;
      };
      expected: {
        categoryID: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
      };
    };

    const arrange: Arrange[] = [
      {
        input: {
          categoryID: category.categoryID.id,
          name: 'test',
          description: 'Some description',
        },
        expected: {
          categoryID: category.categoryID.id,
          name: 'test',
          description: 'Some description',
          isActive: true,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          categoryID: category.categoryID.id,
          name: 'test',
        },
        expected: {
          categoryID: category.categoryID.id,
          name: 'test',
          description: 'Some description',
          isActive: true,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          categoryID: category.categoryID.id,
          name: 'test',
          isActive: false,
        },
        expected: {
          categoryID: category.categoryID.id,
          name: 'test',
          description: 'Some description',
          isActive: false,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          categoryID: category.categoryID.id,
          name: 'test',
        },
        expected: {
          categoryID: category.categoryID.id,
          name: 'test',
          description: 'Some description',
          isActive: false,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          categoryID: category.categoryID.id,
          name: 'test',
          isActive: true,
        },
        expected: {
          categoryID: category.categoryID.id,
          name: 'test',
          description: 'Some description',
          isActive: true,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          categoryID: category.categoryID.id,
          name: 'test',
          description: 'Some description',
          isActive: false,
        },
        expected: {
          categoryID: category.categoryID.id,
          name: 'test',
          description: 'Some description',
          isActive: false,
          createdAt: category.createdAt,
        },
      },
    ];

    for (const data of arrange) {
      output = await useCase.execute({
        categoryID: data.input.categoryID,
        ...(data.input.name && { name: data.input.name }),
        ...('description' in data.input && {
          description: data.input.description,
        }),
        ...('isActive' in data.input && { isActive: data.input.isActive }),
      });

      const categoryUpdateded = await repository.findByID(
        new Uuid(data.input.categoryID)
      );

      expect(output).toStrictEqual({
        categoryID: category.categoryID.id,
        name: data.expected.name,
        description: data.expected.description,
        isActive: data.expected.isActive,
        createdAt: categoryUpdateded!.createdAt,
      });

      expect(categoryUpdateded!.toJSON()).toStrictEqual({
        categoryID: category.categoryID.id,
        name: data.expected.name,
        description: data.expected.description,
        isActive: data.expected.isActive,
        createdAt: categoryUpdateded!.createdAt,
      });
    }
  });
});

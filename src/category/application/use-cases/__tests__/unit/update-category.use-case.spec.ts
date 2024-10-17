import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { InvalidUUIDError, Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../../domain/category.entity";
import { CategoryInMemoryRepository } from "../../../../infra/db/in-memory/category-in-memory.repository";
import { UpdateCategoryUseCase } from "../../update-category.use-case";

describe('UpdateCategoryUseCase Unit Test', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throw an error if category does not exist', async () => {
    await expect(() =>
      useCase.execute({ categoryID: 'fake-id', name: 'fake' })
    ).rejects.toThrow(new InvalidUUIDError());

    const uuid = new Uuid();

    await expect(() =>
      useCase.execute({ categoryID: uuid.id, name: 'fake' })
    ).rejects.toThrow(new NotFoundError(uuid.id, Category));
  });

  it('should update a category', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');

    const category = Category.create({ name: 'Movie' });

    repository.items = [category];

    let output = await useCase.execute({
      categoryID: category.categoryID.id,
      name: 'test',
    });

    expect(spyUpdate).toHaveBeenCalledTimes(1);

    expect(output).toStrictEqual({
      categoryID: category.categoryID.id,
      name: 'test',
      description: null,
      isActive: true,
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
        ...('name' in data.input && { name: data.input.name }),
        ...('description' in data.input && {
          description: data.input.description,
        }),
        ...('isActive' in data.input && { isActive: data.input.isActive }),
      });

      expect(output).toStrictEqual({
        categoryID: category.categoryID.id,
        name: data.expected.name,
        description: data.expected.description,
        isActive: data.expected.isActive,
        createdAt: data.expected.createdAt,
      });
    }
  });
});

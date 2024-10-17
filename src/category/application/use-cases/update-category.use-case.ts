import { IUseCase } from '../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { Category } from '../../domain/category.entity';
import { ICategoryRepository } from '../../domain/category.repository';
import { CategoryOutput, CategoryOutputMapper } from './common/category-output';

export class UpdateCategoryUseCase
  implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const uuid = new Uuid(input.categoryID);

    const category = await this.categoryRepository.findByID(uuid);

    if (!category) {
      throw new NotFoundError(input.categoryID, Category);
    }

    input.name && category.changeName(input.name);

    if ('description' in input) {
      category.changeDescription(input.description);
    }

    if (input.isActive === true) {
      category.activate();
    }

    if (input.isActive === false) {
      category.deactivate();
    }

    await this.categoryRepository.update(category);

    return CategoryOutputMapper.toOutput(category);
  }
}

export type UpdateCategoryInput = {
  categoryID: string;
  name?: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateCategoryOutput = CategoryOutput;

import { IUseCase } from '../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { Category } from '../../domain/category.entity';
import { ICategoryRepository } from '../../domain/category.repository';
import { CategoryOutput, CategoryOutputMapper } from './common/category-output';

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const uuid = new Uuid(input.categoryID);

    const category = await this.categoryRepository.findByID(uuid);

    if (!category) {
      throw new NotFoundError(input.categoryID, Category);
    }

    return CategoryOutputMapper.toOutput(category);
  }
}

export type GetCategoryInput = {
  categoryID: string;
};

export type GetCategoryOutput = CategoryOutput;

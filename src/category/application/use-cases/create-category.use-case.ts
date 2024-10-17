import { IUseCase } from '../../../shared/application/use-case.interface';
import { Category } from '../../domain/category.entity';
import { ICategoryRepository } from '../../domain/category.repository';
import { CategoryOutput, CategoryOutputMapper } from './common/category-output';

export class CreateCategoryUseCase
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const entity = Category.create(input);

    await this.categoryRepository.insert(entity);

    return CategoryOutputMapper.toOutput(entity);
  }
}

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export type CreateCategoryOutput = CategoryOutput;

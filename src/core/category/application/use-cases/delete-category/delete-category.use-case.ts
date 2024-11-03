import { CategoryId } from '@core/category/domain/category.aggregate';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { ICategoryRepository } from '../../../domain/category.repository';

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const categoryId = new CategoryId(input.categoryID);

    await this.categoryRepository.delete(categoryId);
  }
}

export type DeleteCategoryInput = {
  categoryID: string;
};

export type DeleteCategoryOutput = void;

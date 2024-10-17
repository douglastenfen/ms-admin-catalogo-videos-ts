import { IUseCase } from '../../../shared/application/use-case.interface';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { ICategoryRepository } from '../../domain/category.repository';

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const uuid = new Uuid(input.categoryID);

    await this.categoryRepository.delete(uuid);
  }
}

export type DeleteCategoryInput = {
  categoryID: string;
};

export type DeleteCategoryOutput = void;

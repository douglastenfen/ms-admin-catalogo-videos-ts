import { Category } from '../../../domain/category.aggregate';

export type CategoryOutput = {
  categoryID: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
};

export class CategoryOutputMapper {
  static toOutput(entity: Category): CategoryOutput {
    const { categoryID, ...otherProps } = entity.toJSON();

    return {
      categoryID,
      ...otherProps,
    };
  }
}

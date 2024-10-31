import { CategoryOutput } from '@core/category/application/use-cases/common/category-output';
import { ListCategoriesOutput } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/collection.presenter';

export class CategoryPresenter {
  categoryID: string;
  name: string;
  description: string | null;
  isActive: boolean;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;

  constructor(output: CategoryOutput) {
    this.categoryID = output.categoryID;
    this.name = output.name;
    this.description = output.description;
    this.isActive = output.isActive;
    this.createdAt = output.createdAt;
  }
}

export class CategoryCollectionPresenter extends CollectionPresenter {
  data: CategoryPresenter[];

  constructor(output: ListCategoriesOutput) {
    const { items, ...paginationProps } = output;

    super(paginationProps);

    this.data = items.map((item) => new CategoryPresenter(item));
  }
}

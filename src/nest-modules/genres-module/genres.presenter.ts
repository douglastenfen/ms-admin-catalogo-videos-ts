import {
  GenreCategoryOutput,
  GenreOutput,
} from '@core/genre/application/use-cases/common/genre-output';
import { Transform, Type } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/collection.presenter';
import { ListGenresOutput } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';

export class GenreCategoryPresenter {
  categoryId: string;
  name: string;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: GenreCategoryOutput) {
    this.categoryId = output.categoryId;
    this.name = output.name;
    this.createdAt = output.createdAt;
  }
}

export class GenrePresenter {
  genreId: string;
  name: string;
  categoriesId: string[];
  @Type(() => GenreCategoryPresenter)
  categories: GenreCategoryPresenter[];
  isActive: boolean;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: GenreOutput) {
    this.genreId = output.genreId;
    this.name = output.name;
    this.categoriesId = output.categoriesId;
    this.categories = output.categories.map(
      (category) => new GenreCategoryPresenter(category),
    );
    this.isActive = output.isActive;
    this.createdAt = output.createdAt;
  }
}

export class GenreCollectionPresenter extends CollectionPresenter {
  @Type(() => GenrePresenter)
  data: GenrePresenter[];

  constructor(output: ListGenresOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new GenrePresenter(item));
  }
}

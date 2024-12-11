import { CategoryId } from '@core/category/domain/category.aggregate';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '@core/shared/domain/value-object';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { GenreValidatorFactory } from './genre.validator';
import { GenreFakeBuilder } from './genre-fake.builder';

export type GenreConstructorProps = {
  genreId?: GenreId;
  name: string;
  categoriesId: Map<string, CategoryId>;
  isActive?: boolean;
  createdAt?: Date;
};

export type GenreCreateCommand = {
  name: string;
  categoriesId: CategoryId[];
  isActive?: boolean;
};

export class GenreId extends Uuid {}

export class Genre extends AggregateRoot {
  genreId: GenreId;
  name: string;
  categoriesId: Map<string, CategoryId>;
  isActive: boolean;
  createdAt: Date;

  constructor(props: GenreConstructorProps) {
    super();
    this.genreId = props.genreId ?? new GenreId();
    this.name = props.name;
    this.categoriesId = props.categoriesId;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
  }

  get entityId(): ValueObject {
    return this.genreId;
  }

  static create(props: GenreCreateCommand): Genre {
    const genre = new Genre({
      ...props,
      categoriesId: new Map(
        props.categoriesId.map((categoryId) => [categoryId.id, categoryId]),
      ),
    });

    genre.validate(['name']);

    return genre;
  }

  changeName(name: string): void {
    this.name = name;

    this.validate(['name']);
  }

  addCategoryId(categoryId: CategoryId): void {
    this.categoriesId.set(categoryId.id, categoryId);
  }

  removeCategoryId(categoryId: CategoryId): void {
    this.categoriesId.delete(categoryId.id);
  }

  syncCategoriesId(categoriesId: CategoryId[]): void {
    if (categoriesId.length === 0) {
      throw new Error('Categories ID cannot be empty');
    }

    this.categoriesId = new Map(
      categoriesId.map((categoryId) => [categoryId.id, categoryId]),
    );
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  validate(fields?: string[]) {
    const validator = GenreValidatorFactory.create();

    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return GenreFakeBuilder;
  }

  toJSON() {
    return {
      genreId: this.genreId.id,
      name: this.name,
      categoriesId: Array.from(this.categoriesId.values()).map(
        (categoryId) => categoryId.id,
      ),
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}

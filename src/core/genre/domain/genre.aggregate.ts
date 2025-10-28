import { CategoryId } from '@core/category/domain/category.aggregate';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '@core/shared/domain/value-object';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { GenreCreatedEvent } from './domain-events/genre-created.event';
import { GenreDeletedEvent } from './domain-events/genre-deleted.event';
import { GenreUpdatedEvent } from './domain-events/genre-updated.event';
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
    this.registerHandler(GenreCreatedEvent.name, this.onGenreCreated.bind(this));
    this.registerHandler(GenreUpdatedEvent.name, this.onGenreUpdated.bind(this));
    this.registerHandler(GenreDeletedEvent.name, this.onGenreDeleted.bind(this));
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

    genre.applyEvent(
      new GenreCreatedEvent({
        genreId: genre.genreId,
        name: genre.name,
        categoriesId: Array.from(genre.categoriesId.values()),
        isActive: genre.isActive,
        createdAt: genre.createdAt,
      }),
    );

    return genre;
  }

  changeName(name: string): void {
    this.name = name;

    this.validate(['name']);

    this.applyEvent(
      new GenreUpdatedEvent({
        genreId: this.genreId,
        name: this.name,
        categoriesId: Array.from(this.categoriesId.values()),
        isActive: this.isActive,
      }),
    );
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

    this.applyEvent(
      new GenreUpdatedEvent({
        genreId: this.genreId,
        name: this.name,
        categoriesId: Array.from(this.categoriesId.values()),
        isActive: this.isActive,
      }),
    );
  }

  activate(): void {
    this.isActive = true;

    this.applyEvent(
      new GenreUpdatedEvent({
        genreId: this.genreId,
        name: this.name,
        categoriesId: Array.from(this.categoriesId.values()),
        isActive: this.isActive,
      }),
    );
  }

  deactivate(): void {
    this.isActive = false;

    this.applyEvent(
      new GenreUpdatedEvent({
        genreId: this.genreId,
        name: this.name,
        categoriesId: Array.from(this.categoriesId.values()),
        isActive: this.isActive,
      }),
    );
  }

  markAsDeleted(): void {
    this.applyEvent(
      new GenreDeletedEvent({
        genreId: this.genreId,
      }),
    );
  }

  private onGenreCreated(event: GenreCreatedEvent): void {
    // TODO: Handler para o evento de criação, se necessário
  }

  private onGenreUpdated(event: GenreUpdatedEvent): void {
    // TODO: Handler para o evento de atualização, se necessário
  }

  private onGenreDeleted(event: GenreDeletedEvent): void {
    // TODO: Handler para o evento de deleção, se necessário
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

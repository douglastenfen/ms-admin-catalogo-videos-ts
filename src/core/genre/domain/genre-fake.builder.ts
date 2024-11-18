import { CategoryId } from '@core/category/domain/category.aggregate';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Chance } from 'chance';
import { Genre, GenreId } from './genre.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export class GenreFakeBuilder<TBuild = any> {
  private _genreId: PropOrFactory<GenreId> | undefined = undefined;

  private _name: PropOrFactory<string> = (_index) => this.chance.word();

  private _categoriesId: PropOrFactory<CategoryId>[] = [];

  private _isActive: PropOrFactory<boolean> = (_index) => true;

  private _createdAt: PropOrFactory<Date> | undefined = undefined;

  private chance: Chance.Chance;

  private countObjs;

  static aGenre() {
    return new GenreFakeBuilder<Genre>();
  }

  static theGenres(countObjs: number) {
    return new GenreFakeBuilder<Genre[]>(countObjs);
  }

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = new Chance();
  }

  withGenreId(valueOrFactory: PropOrFactory<GenreId>) {
    this._genreId = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  addCategoriesId(valueOrFactory: PropOrFactory<CategoryId>) {
    this._categoriesId.push(valueOrFactory);
    return this;
  }

  activate() {
    this._isActive = true;
    return this;
  }

  deactivate() {
    this._isActive = false;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  withInvalidNameTooLong(value?: string) {
    this._name = () => value ?? this.chance.word({ length: 256 });
    return this;
  }

  build(): TBuild {
    const genres = new Array(this.countObjs).fill(undefined).map((_, index) => {
      const categoryId = new CategoryId();

      const categoriesId = this._categoriesId.length
        ? this.callFactory(this._categoriesId, index)
        : [categoryId];

      const genre = new Genre({
        genreId: !this._genreId
          ? undefined
          : this.callFactory(this._genreId, index),
        name: this.callFactory(this._name, index),
        categoriesId: new Map(
          categoriesId.map((categoryId) => [categoryId.id, categoryId]),
        ),
        isActive: this.callFactory(this._isActive, index),
        ...(this._createdAt && {
          createdAt: this.callFactory(this._createdAt, index),
        }),
      });

      genre.validate();

      return genre;
    });

    return this.countObjs === 1 ? (genres[0] as any) : genres;
  }

  get genreId() {
    return this.getValue('genreId');
  }

  get name() {
    return this.getValue('name');
  }

  get categoriesId() {
    let categoriesId = this.getValue('categoriesId');

    if (!categoriesId.length) {
      categoriesId = [new CategoryId()];
    }

    return categoriesId;
  }

  get isActive() {
    return this.getValue('isActive');
  }

  get createdAt() {
    return this.getValue('createdAt');
  }

  private getValue(prop: string) {
    const optional = ['genreId', 'createdAt'];

    const privateProp = `_${prop}` as keyof this;

    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`,
      );
    }

    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    if (typeof factoryOrValue === 'function') {
      return factoryOrValue(index);
    }

    if (factoryOrValue instanceof Array) {
      return factoryOrValue.map((value) => this.callFactory(value, index));
    }

    return factoryOrValue;
  }
}

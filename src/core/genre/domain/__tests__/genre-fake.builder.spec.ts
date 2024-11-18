import { Chance } from 'chance';
import { GenreFakeBuilder } from '../genre-fake.builder';
import { GenreId } from '../genre.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('GenreFakeBuilder Unit Tests', () => {
  describe('GenreId prop', () => {
    const faker = GenreFakeBuilder.aGenre();

    it('should throw error when any with methods has called', () => {
      expect(() => faker.genreId).toThrow(
        new Error(`Property genreId not have a factory, use 'with' methods`),
      );
    });

    it('should be undefined', () => {
      expect(faker['_genreId']).toBeUndefined();
    });

    test('withGenreId', () => {
      const genreId = new GenreId();

      const $this = faker.withGenreId(genreId);

      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect($this['_genreId']).toBe(genreId);

      faker.withGenreId(() => genreId);

      //@ts-expect-error _genreId is a callable
      expect(faker['_genreId']()).toBe(genreId);

      expect(faker.genreId).toBe(genreId);
    });

    test('withGenreId using factory', () => {
      let mockFactory = jest.fn(() => new GenreId());

      faker.withGenreId(mockFactory);
      faker.build();

      expect(mockFactory).toHaveBeenCalledTimes(1);

      const genreId = new GenreId();

      mockFactory = jest.fn(() => genreId);

      const fakerMany = GenreFakeBuilder.theGenres(2);

      fakerMany.withGenreId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);

      expect(fakerMany.build()[0].genreId).toBe(genreId);
      expect(fakerMany.build()[1].genreId).toBe(genreId);
    });
  });

  describe('name prop', () => {
    const faker = GenreFakeBuilder.aGenre();
    it('should be a function', () => {
      expect(faker['_name']).toBeInstanceOf(Function);
    });

    it('should call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');

      faker['chance'] = chance;

      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withName', () => {
      const $this = faker.withName('any_name');

      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect($this['_name']).toBe('any_name');

      faker.withName(() => 'any_name');

      //@ts-expect-error _name is a callable
      expect(faker['_name']()).toBe('any_name');

      expect(faker.name).toBe('any_name');
    });

    it('should pass index to name factory', () => {
      faker.withName((index) => `name_${index}`);

      const genre = faker.build();
      expect(genre.name).toBe('name_0');

      const fakerMany = GenreFakeBuilder.theGenres(2);

      fakerMany.withName((index) => `name_${index}`);

      const genres = fakerMany.build();

      expect(genres[0].name).toBe('name_0');
      expect(genres[1].name).toBe('name_1');
    });

    test('invalid too long name', () => {
      const $this = faker.withInvalidNameTooLong();

      expect($this).toBeInstanceOf(GenreFakeBuilder);

      expect(faker.name).toHaveLength(256);

      faker.withInvalidNameTooLong();

      expect(faker.name).toHaveLength(256);
    });
  });

  describe('categoriesId prop', () => {
    const faker = GenreFakeBuilder.aGenre();

    it('should be an empty array', () => {
      expect(faker['_categoriesId']).toEqual([]);
    });

    test('addCategoriesId', () => {
      const categoryId = new CategoryId();
      const anotherCategoryId = new CategoryId();

      const $this = faker.addCategoriesId(categoryId);

      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker['_categoriesId']).toEqual([categoryId]);

      faker.addCategoriesId(() => anotherCategoryId);

      expect(faker.categoriesId).toEqual([categoryId, anotherCategoryId]);
    });
  });

  describe('isActive prop', () => {
    const faker = GenreFakeBuilder.aGenre();

    it('should be a function', () => {
      expect(typeof faker['_isActive']).toBe('function');
    });

    test('activate', () => {
      const $this = faker.activate();

      expect($this).toBeInstanceOf(GenreFakeBuilder);

      expect(faker['_isActive']).toBe(true);
      expect(faker.isActive).toBe(true);
    });

    test('deactivate', () => {
      const $this = faker.deactivate();

      expect($this).toBeInstanceOf(GenreFakeBuilder);

      expect(faker['_isActive']).toBe(false);
      expect(faker.isActive).toBe(false);
    });
  });

  describe('createdAt prop', () => {
    const faker = GenreFakeBuilder.aGenre();

    it('should throw error when any with methods has called', () => {
      expect(() => faker.createdAt).toThrow(
        new Error(`Property createdAt not have a factory, use 'with' methods`),
      );
    });

    it('should be undefined', () => {
      expect(faker['_createdAt']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const createdAt = new Date();
      const $this = faker.withCreatedAt(createdAt);

      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect($this['_createdAt']).toBe(createdAt);

      faker.withCreatedAt(() => createdAt);

      //@ts-expect-error _createdAt is a callable
      expect(faker['_createdAt']()).toBe(createdAt);
      expect(faker.createdAt).toBe(createdAt);
    });

    it('should pass index to createdAt factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));

      const genre = faker.build();
      expect(genre.createdAt).toEqual(new Date(date.getTime() + 2));

      const fakerMany = GenreFakeBuilder.theGenres(2);

      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));

      const genres = fakerMany.build();

      expect(genres[0].createdAt).toEqual(new Date(date.getTime() + 2));
      expect(genres[1].createdAt).toEqual(new Date(date.getTime() + 3));
    });
  });

  it('should create a genre', () => {
    const faker = GenreFakeBuilder.aGenre();
    let genre = faker.build();

    expect(genre.genreId).toBeInstanceOf(GenreId);
    expect(typeof genre.name).toBe('string');
    expect(genre.categoriesId.size).toEqual(1);
    expect(genre.isActive).toBe(true);
    expect(genre.createdAt).toBeInstanceOf(Date);

    const createdAt = new Date();
    const genreId = new GenreId();
    const categoryId = new CategoryId();

    genre = GenreFakeBuilder.aGenre()
      .withGenreId(genreId)
      .withName('any_name')
      .addCategoriesId(categoryId)
      .deactivate()
      .withCreatedAt(createdAt)
      .build();

    expect(genre.genreId).toBe(genreId);
    expect(genre.name).toBe('any_name');
    expect(genre.categoriesId.size).toEqual(1);
    expect(genre.categoriesId).toEqual(new Map([[categoryId.id, categoryId]]));
    expect(genre.isActive).toBe(false);
    expect(genre.createdAt).toBe(createdAt);
  });

  it('should create many genres', () => {
    const faker = GenreFakeBuilder.theGenres(2);
    let genres = faker.build();

    genres.forEach((genre) => {
      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(typeof genre.name).toBe('string');
      expect(genre.categoriesId.size).toEqual(1);
      expect(genre.isActive).toBe(true);
      expect(genre.createdAt).toBeInstanceOf(Date);
    });

    const createdAt = new Date();
    const genreId = new GenreId();
    const categoryId = new CategoryId();

    genres = GenreFakeBuilder.theGenres(2)
      .withGenreId(genreId)
      .withName('any_name')
      .addCategoriesId(categoryId)
      .deactivate()
      .withCreatedAt(createdAt)
      .build();

    genres.forEach((genre) => {
      expect(genre.genreId).toBe(genreId);
      expect(genre.name).toBe('any_name');
      expect(genre.categoriesId.size).toEqual(1);
      expect(genre.categoriesId).toEqual(
        new Map([[categoryId.id, categoryId]]),
      );
      expect(genre.isActive).toBe(false);
      expect(genre.createdAt).toBe(createdAt);
    });
  });
});

import { CategoryId } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '../genre.aggregate';

describe('Genre Unit Tests', () => {
  beforeEach(() => {
    Genre.prototype.validate = jest
      .fn()
      .mockImplementation(Genre.prototype.validate);
  });

  describe('constructor', () => {
    it('should create a genre', () => {
      const categoryId = new CategoryId();
      const categoriesId = new Map<string, CategoryId>([
        [categoryId.id, categoryId],
      ]);

      let genre = new Genre({
        name: 'Action',
        categoriesId,
      });

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('Action');
      expect(genre.categoriesId).toEqual(categoriesId);
      expect(genre.isActive).toBe(true);
      expect(genre.createdAt).toBeInstanceOf(Date);

      const createdAt = new Date();

      genre = new Genre({
        genreId: new GenreId(),
        name: 'Action',
        categoriesId,
        isActive: false,
        createdAt,
      });

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('Action');
      expect(genre.categoriesId).toEqual(categoriesId);
      expect(genre.isActive).toBe(false);
      expect(genre.createdAt).toBe(createdAt);
    });
  });

  describe('genreId', () => {
    const categoryId = new CategoryId();
    const categoriesId = new Map<string, CategoryId>([
      [categoryId.id, categoryId],
    ]);

    const arrange = [
      { name: 'Action', categoriesId },
      { name: 'Action', categoriesId, id: null },
      { name: 'Action', categoriesId, id: undefined },
      { name: 'Action', categoriesId, id: new GenreId() },
    ];

    test.each(arrange)('when props are %p', (item) => {
      const genre = new Genre(item);

      expect(genre.genreId).toBeInstanceOf(GenreId);
    });
  });

  describe('create command', () => {
    it('should create a genre', () => {
      const categoryId = new CategoryId();
      const categoriesId = new Map<string, CategoryId>([
        [categoryId.id, categoryId],
      ]);

      const genre = Genre.create({
        name: 'Action',
        categoriesId: [categoryId],
      });

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('Action');
      expect(genre.categoriesId).toEqual(categoriesId);
      expect(genre.createdAt).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);

      const anotherGenre = Genre.create({
        name: 'Action',
        categoriesId: [categoryId],
        isActive: false,
      });

      expect(anotherGenre.genreId).toBeInstanceOf(GenreId);
      expect(anotherGenre.name).toBe('Action');
      expect(anotherGenre.categoriesId).toEqual(categoriesId);
      expect(anotherGenre.isActive).toBe(false);
      expect(anotherGenre.createdAt).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
    });
  });

  it('should change name', () => {
    const genre = Genre.create({
      name: 'Action',
      categoriesId: [new CategoryId()],
    });

    genre.changeName('Adventure');

    expect(genre.name).toBe('Adventure');
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
  });

  it('should add category id', () => {
    const categoryId = new CategoryId();

    const genre = Genre.create({
      name: 'Action',
      categoriesId: [categoryId],
    });

    genre.addCategoryId(categoryId);

    expect(genre.categoriesId.size).toBe(1);
    expect(genre.categoriesId).toEqual(new Map([[categoryId.id, categoryId]]));
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);

    const anotherCategoryId = new CategoryId();

    genre.addCategoryId(anotherCategoryId);

    expect(genre.categoriesId.size).toBe(2);
    expect(genre.categoriesId).toEqual(
      new Map([
        [categoryId.id, categoryId],
        [anotherCategoryId.id, anotherCategoryId],
      ]),
    );
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
  });
});

describe('Genre Validator', () => {
  describe('create command', () => {
    it('should throw an error when name is invalid', () => {
      const categoryId = new CategoryId();

      const genre = Genre.create({
        name: 'a'.repeat(256),
        categoriesId: [categoryId],
      } as any);

      expect(genre.notification.hasErrors()).toBe(true);
      expect(genre.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('change name method', () => {
    it('should throw an error when name is invalid', () => {
      const categoryId = new CategoryId();

      const genre = Genre.create({
        name: 'Action',
        categoriesId: [categoryId],
      });

      genre.changeName('a'.repeat(256));

      expect(genre.notification.hasErrors()).toBe(true);
      expect(genre.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});

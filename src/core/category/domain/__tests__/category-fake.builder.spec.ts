import { Chance } from 'chance';
import { CategoryFakeBuilder } from '../category-fake.builder';
import { CategoryId } from '../category.aggregate';

describe('CategoryFakeBuilder Unit Tests', () => {
  describe('categoryID prop', () => {
    const faker = CategoryFakeBuilder.aCategory();
    test('should throw error when any with methods has called', () => {
      expect(() => faker.categoryID).toThrow(
        new Error(`Property categoryID not have a factory, use 'with' methods`),
      );
    });

    test('should be undefined', () => {
      expect(faker['_categoryID']).toBeUndefined();
    });

    test('withCategoryID', () => {
      const categoryID = new CategoryId();
      const $this = faker.withCategoryID(categoryID);

      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect($this['_categoryID']).toBe(categoryID);

      faker.withCategoryID(() => categoryID);

      //@ts-expect-error _categoryID is a callable
      expect(faker['_categoryID']()).toBe(categoryID);

      expect(faker.categoryID).toBe(categoryID);
    });

    test('withCategoryID using factory', () => {
      let mockFactory = jest.fn(() => new CategoryId());

      faker.withCategoryID(mockFactory);
      faker.build();

      expect(mockFactory).toHaveBeenCalledTimes(1);

      const categoryID = new CategoryId();

      mockFactory = jest.fn(() => categoryID);

      const fakerMany = CategoryFakeBuilder.theCategories(2);

      fakerMany.withCategoryID(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);

      expect(fakerMany.build()[0].categoryID).toBe(categoryID);
      expect(fakerMany.build()[1].categoryID).toBe(categoryID);
    });
  });

  describe('name prop', () => {
    const faker = CategoryFakeBuilder.aCategory();

    test('should be a function', () => {
      expect(faker['_name']).toBeInstanceOf(Function);
    });

    test('should call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');

      faker['chance'] = chance;

      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withName', () => {
      const $this = faker.withName('Movie');

      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect($this['_name']).toBe('Movie');

      faker.withName(() => 'TV Show');

      //@ts-expect-error _name is a callable
      expect(faker['_name']()).toBe('TV Show');
      expect(faker.name).toBe('TV Show');
    });

    test('should pass index to name factory', () => {
      faker.withName((index) => `Movie ${index}`);

      const category = faker.build();
      expect(category.name).toBe('Movie 0');

      const fakerMany = CategoryFakeBuilder.theCategories(2);

      fakerMany.withName((index) => `Movie ${index}`);

      const categories = fakerMany.build();
      expect(categories[0].name).toBe('Movie 0');
      expect(categories[1].name).toBe('Movie 1');
    });

    test('invalid too long name', () => {
      const $this = faker.withInvalidNameTooLong();

      expect($this).toBeInstanceOf(CategoryFakeBuilder);

      expect(faker.name).toHaveLength(256);

      const tooLong = 'a'.repeat(256);

      faker.withInvalidNameTooLong(tooLong);

      expect(faker.name.length).toBe(256);
      expect(faker.name).toBe(tooLong);
    });
  });

  describe('description prop', () => {
    const faker = CategoryFakeBuilder.aCategory();

    test('should be a function', () => {
      expect(typeof faker['_description']).toBe('function');
    });

    test('should call the paragraph method', () => {
      const chance = Chance();

      const spyParagraphMethod = jest.spyOn(chance, 'paragraph');

      faker['chance'] = chance;

      faker.build();

      expect(spyParagraphMethod).toHaveBeenCalled();
    });

    test('withDescription', () => {
      const $this = faker.withDescription('All about movies');

      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect($this['_description']).toBe('All about movies');

      faker.withDescription(() => 'All about TV Shows');

      //@ts-expect-error _description is a callable
      expect(faker['_description']()).toBe('All about TV Shows');
      expect(faker.description).toBe('All about TV Shows');
    });

    test('should pass index to description factory', () => {
      faker.withDescription((index) => `All about movies ${index}`);

      const category = faker.build();
      expect(category.description).toBe('All about movies 0');

      const fakerMany = CategoryFakeBuilder.theCategories(2);

      fakerMany.withDescription((index) => `All about movies ${index}`);

      const categories = fakerMany.build();
      expect(categories[0].description).toBe('All about movies 0');
      expect(categories[1].description).toBe('All about movies 1');
    });
  });

  describe('isActive prop', () => {
    const faker = CategoryFakeBuilder.aCategory();

    test('should be a function', () => {
      expect(typeof faker['_isActive']).toBe('function');
    });

    test('activate', () => {
      const $this = faker.activate();

      expect($this).toBeInstanceOf(CategoryFakeBuilder);

      expect(faker['_isActive']).toBe(true);
      expect(faker.isActive).toBe(true);
    });

    test('deactivate', () => {
      const $this = faker.deactivate();

      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect(faker['_isActive']).toBe(false);
      expect(faker.isActive).toBe(false);
    });
  });

  describe('createdAt prop', () => {
    const faker = CategoryFakeBuilder.aCategory();

    test('should throw error when any with methods has called', () => {
      const fakerCategory = CategoryFakeBuilder.aCategory();

      expect(() => fakerCategory.createdAt).toThrow(
        new Error(`Property createdAt not have a factory, use 'with' methods`),
      );
    });

    test('should be undefined', () => {
      expect(faker['_createdAt']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const createdAt = new Date();
      const $this = faker.withCreatedAt(createdAt);

      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect($this['_createdAt']).toBe(createdAt);

      faker.withCreatedAt(() => createdAt);

      //@ts-expect-error _createdAt is a callable
      expect(faker['_createdAt']()).toBe(createdAt);
      expect(faker.createdAt).toBe(createdAt);
    });

    test('should pass index to createdAt factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));

      const category = faker.build();
      expect(category.createdAt.getTime()).toBe(date.getTime() + 2);

      const fakerMany = CategoryFakeBuilder.theCategories(2);

      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));

      const categories = fakerMany.build();

      expect(categories[0].createdAt.getTime()).toBe(date.getTime() + 2);
      expect(categories[1].createdAt.getTime()).toBe(date.getTime() + 3);
    });
  });

  test('should create a category', () => {
    const faker = CategoryFakeBuilder.aCategory();
    let category = faker.build();

    expect(category.categoryID).toBeInstanceOf(CategoryId);
    expect(typeof category.name).toBe('string');
    expect(typeof category.description).toBe('string');
    expect(category.isActive).toBe(true);
    expect(category.createdAt).toBeInstanceOf(Date);

    const createdAt = new Date();
    const categoryID = new CategoryId();

    category = faker
      .withCategoryID(categoryID)
      .withName('Movie')
      .withDescription('All about movies')
      .deactivate()
      .withCreatedAt(createdAt)
      .build();

    expect(category.categoryID).toBe(categoryID);
    expect(category.name).toBe('Movie');
    expect(category.description).toBe('All about movies');
    expect(category.isActive).toBe(false);
    expect(category.createdAt).toBe(createdAt);
  });

  test('should create many categories', () => {
    const faker = CategoryFakeBuilder.theCategories(2);
    let categories = faker.build();

    categories.forEach((category) => {
      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(typeof category.name).toBe('string');
      expect(typeof category.description).toBe('string');
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    const createdAt = new Date();
    const categoryID = new CategoryId();

    categories = faker
      .withCategoryID(categoryID)
      .withName('Movie')
      .withDescription('All about movies')
      .deactivate()
      .withCreatedAt(createdAt)
      .build();

    categories.forEach((category) => {
      expect(category.categoryID).toBe(categoryID);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('All about movies');
      expect(category.isActive).toBe(false);
      expect(category.createdAt).toBe(createdAt);
    });
  });
});

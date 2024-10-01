import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { Category } from '../domain/category.entity';

describe('CategoryEntity Unit Tests', () => {
  let validateSpy: any;

  beforeEach(() => {
    validateSpy = jest.spyOn(Category, 'validate');
  });

  describe('constructor', () => {
    test('should create a category with default values', () => {
      const category = new Category({
        name: 'Movie',
      });

      expect(category.categoryID).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    test('should create a category with all values', () => {
      const createdAt = new Date();
      const category = new Category({
        name: 'Movie',
        description: 'All about movies',
        isActive: false,
        createdAt,
      });

      expect(category.categoryID).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('All about movies');
      expect(category.isActive).toBe(false);
      expect(category.createdAt).toBe(createdAt);
    });

    test('should create a category with name and description', () => {
      const category = new Category({
        name: 'Movie',
        description: 'All about movies',
      });

      expect(category.categoryID).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('All about movies');
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('using command to create', () => {
    test('should create a category', () => {
      const category = Category.create({
        name: 'Movie',
      });

      expect(category.categoryID).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('should create a category with description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'All about movies',
      });

      expect(category.categoryID).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('All about movies');
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('should create a category with isActive', () => {
      const category = Category.create({
        name: 'Movie',
        isActive: false,
      });

      expect(category.categoryID).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(false);
      expect(category.createdAt).toBeInstanceOf(Date);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('categoryID field', () => {
    const arrange = [
      { categoryID: null },
      { categoryID: undefined },
      { categoryID: new Uuid() },
    ];

    test.each(arrange)(
      'should create a category with categoryID = %j',
      ({ categoryID }) => {
        const category = new Category({
          categoryID: categoryID as any,
          name: 'Movie',
        });

        expect(category.categoryID).toBeInstanceOf(Uuid);

        if (categoryID instanceof Uuid) {
          expect(category.categoryID).toBe(categoryID);
        }
      }
    );
  });

  test('should change name', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.changeName('Film');

    expect(category.name).toBe('Film');

    expect(validateSpy).toHaveBeenCalledTimes(2);
  });

  test('should change description', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.changeDescription('All about movies');

    expect(category.description).toBe('All about movies');

    expect(validateSpy).toHaveBeenCalledTimes(2);
  });

  test('should activate category', () => {
    const category = Category.create({
      name: 'Movie',
      isActive: false,
    });

    category.activate();

    expect(category.isActive).toBe(true);
  });

  test('should deactivate category', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.deactivate();

    expect(category.isActive).toBe(false);
  });
});

describe('CategoryEntity Validation', () => {
  describe('create command', () => {
    const arrange = [
      { name: null },
      { name: '' },
      { name: 5 as any },
      { name: 'a'.repeat(256) },
    ];

    test.each(arrange)(
      'should throw error if name is invalid: %j',
      ({ name }) => {
        expect(() => Category.create({ name })).containsErrorMessages({
          name: [
            ...(name === null ? ['name should not be empty'] : []),
            ...(name === '' ? ['name should not be empty'] : []),
            ...(typeof name !== 'string'
              ? [
                  'name must be a string',
                  'name must be shorter than or equal to 255 characters',
                ]
              : []),
            ...(typeof name === 'string' && name.length > 255
              ? ['name must be shorter than or equal to 255 characters']
              : []),
          ],
        });
      }
    );
    test('should throw error if name is invalid', () => {
      expect(() => Category.create({ name: null })).containsErrorMessages({
        name: [
          'name should not be empty',
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() => Category.create({ name: '' })).containsErrorMessages({
        name: ['name should not be empty'],
      });

      expect(() => Category.create({ name: 5 as any })).containsErrorMessages({
        name: [
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() =>
        Category.create({ name: 'a'.repeat(256) })
      ).containsErrorMessages({
        name: ['name must be shorter than or equal to 255 characters'],
      });
    });

    it('should throw error if description is invalid', () => {
      expect(() =>
        Category.create({ description: 5 } as any)
      ).containsErrorMessages({
        description: ['description must be a string'],
      });
    });

    it('should throw error if isActive is invalid', () => {
      expect(() =>
        Category.create({ isActive: 5 } as any)
      ).containsErrorMessages({
        isActive: ['isActive must be a boolean value'],
      });
    });
  });

  describe('changeName command', () => {
    it('should throw error if name is invalid', () => {
      const category = Category.create({ name: 'Movie' });

      expect(() => category.changeName(null)).containsErrorMessages({
        name: [
          'name should not be empty',
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() => category.changeName('')).containsErrorMessages({
        name: ['name should not be empty'],
      });

      expect(() => category.changeName(5 as any)).containsErrorMessages({
        name: [
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() => category.changeName('a'.repeat(256))).containsErrorMessages({
        name: ['name must be shorter than or equal to 255 characters'],
      });
    });
  });

  describe('changeDescription command', () => {
    it('should throw error if description is invalid', () => {
      const category = Category.create({ name: 'Movie' });

      expect(() => category.changeDescription(5 as any)).containsErrorMessages({
        description: ['description must be a string'],
      });

      expect(() => category.changeDescription('')).containsErrorMessages({
        description: ['description should not be empty'],
      });

      expect(() => category.changeDescription(null)).containsErrorMessages({
        description: ['description must be a string'],
      });

      expect(() =>
        category.changeDescription('a'.repeat(256))
      ).containsErrorMessages({
        description: [
          'description must be shorter than or equal to 255 characters',
        ],
      });
    });
  });
});

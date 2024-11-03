import { Category, CategoryId } from '../category.aggregate';

describe('CategoryEntity Unit Tests', () => {
  beforeEach(() => {
    Category.prototype.validate = jest
      .fn()
      .mockImplementation(Category.prototype.validate);
  });

  describe('constructor', () => {
    it('should create a category with default values', () => {
      const category = new Category({
        name: 'Movie',
      });

      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it('should create a category with all values', () => {
      const createdAt = new Date();
      const category = new Category({
        name: 'Movie',
        description: 'All about movies',
        isActive: false,
        createdAt,
      });

      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('All about movies');
      expect(category.isActive).toBe(false);
      expect(category.createdAt).toBe(createdAt);
    });

    it('should create a category with name and description', () => {
      const category = new Category({
        name: 'Movie',
        description: 'All about movies',
      });

      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('All about movies');
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it('should create a category with name and isActive', () => {
      const category = new Category({
        name: 'Movie',
        isActive: true,
      });

      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it('should create a category with name and createdAt', () => {
      const createdAt = new Date();
      const category = new Category({
        name: 'Movie',
        createdAt,
      });

      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBe(createdAt);
    });
  });

  describe('using command to create', () => {
    it('should create a category', () => {
      const category = Category.create({
        name: 'Movie',
      });

      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);

      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should create a category with description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'All about movies',
      });

      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('All about movies');
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);

      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should create a category with isActive', () => {
      const category = Category.create({
        name: 'Movie',
        isActive: false,
      });

      expect(category.categoryID).toBeInstanceOf(CategoryId);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(false);
      expect(category.createdAt).toBeInstanceOf(Date);

      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBe(false);
    });
  });

  describe('categoryID field', () => {
    const arrange = [
      { categoryID: null },
      { categoryID: undefined },
      { categoryID: new CategoryId() },
    ];

    test.each(arrange)(
      'should create a category with categoryID = %j',
      (props) => {
        const category = new Category(props as any);

        expect(category.categoryID).toBeInstanceOf(CategoryId);
      },
    );
  });

  it('should change name', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.changeName('Film');

    expect(category.name).toBe('Film');

    expect(Category.prototype.validate).toHaveBeenCalledTimes(2);
    expect(category.notification.hasErrors()).toBe(false);
  });

  it('should change description', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.changeDescription('All about movies');

    expect(category.description).toBe('All about movies');

    expect(category.notification.hasErrors()).toBe(false);
  });

  it('should activate category', () => {
    const category = Category.create({
      name: 'Movie',
      isActive: false,
    });

    category.activate();

    expect(category.isActive).toBe(true);

    expect(category.notification.hasErrors()).toBe(false);
  });

  it('should deactivate category', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.deactivate();

    expect(category.isActive).toBe(false);

    expect(category.notification.hasErrors()).toBe(false);
  });
});

describe('CategoryEntity Validator', () => {
  describe('create command', () => {
    it('should an invalid category with name property', () => {
      const category = Category.create({ name: 'a'.repeat(256) });

      expect(category.notification.hasErrors()).toBe(true);
      expect(category.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeName command', () => {
    it('should an invalid category using name property', () => {
      const category = Category.create({ name: 'Movie' });

      category.changeName('a'.repeat(256));

      expect(category.notification.hasErrors()).toBe(true);
      expect(category.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});

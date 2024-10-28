import { Category } from '../../../domain/category.entity';
import { CategoryInMemoryRepository } from './category-in-memory.repository';

describe('CategoryInMemoryRepository Unit Tests', () => {
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
  });

  it('should return the Category entity', () => {
    const entity = repository.getEntity();
    expect(entity).toBe(Category);
  });

  describe('using filters', () => {
    it('should no filter items when filter object is null', async () => {
      const items = [Category.fake().aCategory().build()];

      const filterSpy = jest.spyOn(items, 'filter' as any);

      const filteredItems = await repository['applyFilter'](items, null);

      expect(filterSpy).not.toHaveBeenCalled();
      expect(filteredItems).toStrictEqual(items);
    });

    it('should filter items using filter param', async () => {
      const items = [
        Category.fake().aCategory().withName('test').build(),
        Category.fake().aCategory().withName('TEST').build(),
        Category.fake().aCategory().withName('fake').build(),
      ];

      const filterSpy = jest.spyOn(items, 'filter' as any);

      const filteredItems = await repository['applyFilter'](items, 'TEST');

      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(filteredItems).toStrictEqual([items[0], items[1]]);
    });

    it('should sort by createdAt when sort param is null', async () => {
      const createdAt = new Date();

      const items = [
        Category.fake()
          .aCategory()
          .withName('test')
          .withCreatedAt(createdAt)
          .build(),
        Category.fake()
          .aCategory()
          .withName('TEST')
          .withCreatedAt(new Date(createdAt.getTime() + 100))
          .build(),
        Category.fake()
          .aCategory()
          .withName('fake')
          .withCreatedAt(new Date(createdAt.getTime() + 200))
          .build(),
      ];

      const sortedItems = repository['applySort'](items, null, null);
      expect(sortedItems).toStrictEqual([items[2], items[1], items[0]]);
    });

    it('should sort by name when sort param is name', async () => {
      const items = [
        Category.fake().aCategory().withName('c').build(),
        Category.fake().aCategory().withName('b').build(),
        Category.fake().aCategory().withName('a').build(),
      ];

      let sortedItems = repository['applySort'](items, 'name', 'asc');
      expect(sortedItems).toStrictEqual([items[2], items[1], items[0]]);

      sortedItems = repository['applySort'](items, 'name', 'desc');
      expect(sortedItems).toStrictEqual([items[0], items[1], items[2]]);
    });
  });
});

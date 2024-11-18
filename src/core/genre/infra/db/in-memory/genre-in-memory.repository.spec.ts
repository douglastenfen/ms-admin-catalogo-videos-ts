import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from './genre-in-memory.repository';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('GenreInMemoryRepository Unit Tests', () => {
  let repository: GenreInMemoryRepository;

  beforeEach(() => {
    repository = new GenreInMemoryRepository();
  });

  it('should return the Genre entity', () => {
    const entity = repository.getEntity();
    expect(entity).toBe(Genre);
  });

  describe('using filters', () => {
    it('should no filter items when filter object is null', async () => {
      const items = [
        Genre.fake().aGenre().build(),
        Genre.fake().aGenre().build(),
      ];

      const filterSpy = jest.spyOn(items, 'filter' as any);

      const filteredItems = await repository['applyFilter'](items, null!);

      expect(filterSpy).not.toHaveBeenCalled();
      expect(filteredItems).toStrictEqual(items);
    });

    it('should filter items using filter param', async () => {
      const faker = Genre.fake().aGenre();
      const items = [
        faker.withName('test').build(),
        faker.withName('TEST').build(),
        faker.withName('fake').build(),
      ];

      const filterSpy = jest.spyOn(items, 'filter' as any);

      const filteredItems = await repository['applyFilter'](items, {
        name: 'TEST',
      });

      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(filteredItems).toStrictEqual([items[0], items[1]]);
    });

    it('should filter items by categoriesId', async () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const categoryId3 = new CategoryId();
      const categoryId4 = new CategoryId();

      const items = [
        Genre.fake()
          .aGenre()
          .addCategoriesId(categoryId1)
          .addCategoriesId(categoryId2)
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoriesId(categoryId3)
          .addCategoriesId(categoryId4)
          .build(),
      ];

      const filterSpy = jest.spyOn(items, 'filter' as any);

      let itemsFiltered = await repository['applyFilter'](items, {
        categoriesId: [categoryId1],
      });

      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(itemsFiltered).toStrictEqual([items[0]]);

      itemsFiltered = await repository['applyFilter'](items, {
        categoriesId: [categoryId2],
      });

      expect(filterSpy).toHaveBeenCalledTimes(2);
      expect(itemsFiltered).toStrictEqual([items[0]]);

      itemsFiltered = await repository['applyFilter'](items, {
        categoriesId: [categoryId1, categoryId2],
      });

      expect(filterSpy).toHaveBeenCalledTimes(3);
      expect(itemsFiltered).toStrictEqual([items[0]]);

      itemsFiltered = await repository['applyFilter'](items, {
        categoriesId: [categoryId1, categoryId3],
      });

      expect(filterSpy).toHaveBeenCalledTimes(4);
      expect(itemsFiltered).toStrictEqual([...items]);

      itemsFiltered = await repository['applyFilter'](items, {
        categoriesId: [categoryId3, categoryId1],
      });

      expect(filterSpy).toHaveBeenCalledTimes(5);
      expect(itemsFiltered).toStrictEqual([...items]);
    });

    it('should filter items by name and categoriesId', async () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const categoryId3 = new CategoryId();
      const categoryId4 = new CategoryId();
      const items = [
        Genre.fake()
          .aGenre()
          .withName('test')
          .addCategoriesId(categoryId1)
          .addCategoriesId(categoryId2)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('fake')
          .addCategoriesId(categoryId3)
          .addCategoriesId(categoryId4)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('test fake')
          .addCategoriesId(categoryId1)
          .build(),
      ];

      let itemsFiltered = await repository['applyFilter'](items, {
        name: 'test',
        categoriesId: [categoryId1],
      });
      expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

      itemsFiltered = await repository['applyFilter'](items, {
        name: 'test',
        categoriesId: [categoryId3],
      });
      expect(itemsFiltered).toStrictEqual([]);

      itemsFiltered = await repository['applyFilter'](items, {
        name: 'fake',
        categoriesId: [categoryId4],
      });
      expect(itemsFiltered).toStrictEqual([items[1]]);
    });

    it('should sort by createdAt when sort param is null', () => {
      const items = [
        Genre.fake().aGenre().withCreatedAt(new Date()).build(),
        Genre.fake()
          .aGenre()
          .withCreatedAt(new Date(new Date().getTime() + 1))
          .build(),
        Genre.fake()
          .aGenre()
          .withCreatedAt(new Date(new Date().getTime() + 2))
          .build(),
      ];

      const itemsSorted = repository['applySort'](items, null, null);
      expect(itemsSorted).toStrictEqual([...items].reverse());
    });

    it('should sort by name', () => {
      const items = [
        Genre.fake().aGenre().withName('c').build(),
        Genre.fake().aGenre().withName('b').build(),
        Genre.fake().aGenre().withName('a').build(),
      ];

      const itemsSorted = repository['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([...items].reverse());

      const itemsSortedDesc = repository['applySort'](items, 'name', 'desc');
      expect(itemsSortedDesc).toStrictEqual(items);
    });
  });
});

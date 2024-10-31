import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize-helper';
import { Category } from '../../../../domain/category.entity';
import {
  CategorySearchParams,
  CategorySearchResult,
} from '../../../../domain/category.repository';
import { CategorySequelizeRepository } from '../category-sequelize.repository';
import { CategoryModel } from '../category.model';
import { CategoryModelMapper } from '../category.model.mapper';

describe('CategorySequelizeRepository Integration Test', () => {
  let repository: CategorySequelizeRepository;
  setupSequelize({ models: [CategoryModel] });

  beforeEach(async () => {
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  it('should insert a new category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    const categoryCreated = await repository.findByID(category.categoryID);

    expect(categoryCreated!.toJSON()).toStrictEqual(category.toJSON());
  });

  it('should find a category by id', async () => {
    let categoryFound = await repository.findByID(new Uuid());
    expect(categoryFound).toBeNull();

    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    categoryFound = await repository.findByID(category.categoryID);

    expect(category.toJSON()).toStrictEqual(categoryFound!.toJSON());
  });

  it('should return all categories', async () => {
    const categories = Category.fake().theCategories(3).build();
    await repository.bulkInsert(categories);

    const categoriesFound = await repository.findAll();

    expect(categoriesFound).toHaveLength(3);

    expect(JSON.stringify(categories)).toStrictEqual(
      JSON.stringify(categoriesFound),
    );
  });

  it('should throw an error on update when a category does not exist', async () => {
    const category = Category.fake().aCategory().build();

    await expect(repository.update(category)).rejects.toThrow(
      new NotFoundError(category.categoryID.id, Category),
    );
  });

  it('should update a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    category.changeName('Movie Updated');
    category.changeDescription('new description');

    await repository.update(category);

    const categoryFound = await repository.findByID(category.categoryID);

    expect(category.toJSON()).toStrictEqual(categoryFound!.toJSON());
  });

  it('should throw an error on delete when a category does not exist', async () => {
    const categoryID = new Uuid();

    await expect(repository.delete(categoryID)).rejects.toThrow(
      new NotFoundError(categoryID.id, Category),
    );
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    await repository.delete(category.categoryID);

    await expect(repository.findByID(category.categoryID)).resolves.toBeNull();
  });

  describe('search methods tests', () => {
    it('should only apply paginate when other params are null', async () => {
      const createdAt = new Date();
      const categories = Category.fake()
        .theCategories(16)
        .withName('Movie')
        .withDescription(null)
        .withCreatedAt(createdAt)
        .build();

      await repository.bulkInsert(categories);

      const spyToEntity = jest.spyOn(CategoryModelMapper, 'toEntity');

      const searchOutput = await repository.search(new CategorySearchParams());

      expect(searchOutput).toBeInstanceOf(CategorySearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });

      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(Category);
        expect(item.categoryID).toBeDefined();
      });

      const items = searchOutput.items.map((item) => item.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'Movie',
          description: null,
          isActive: true,
          createdAt,
        }),
      );
    });

    it('should order by createdAt DESC when search params are null', async () => {
      const createdAt = new Date();
      const categories = Category.fake()
        .theCategories(16)
        .withName((index) => `Movie ${index}`)
        .withDescription(null)
        .withCreatedAt((index) => new Date(createdAt.getTime() + index))
        .build();

      const searchOutput = await repository.search(new CategorySearchParams());

      const items = searchOutput.items;

      [...items].reverse().forEach((item, index) => {
        expect(`Movie ${index}`).toBe(`${categories[index].name}`);
      });
    });

    it('should apply paginate and filter', async () => {
      const categories = [
        Category.fake()
          .aCategory()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];

      await repository.bulkInsert(categories);

      let searchOutput = await repository.search(
        new CategorySearchParams({
          page: 1,
          perPage: 2,
          filter: 'TEST',
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[0], categories[2]],
          total: 3,
          currentPage: 1,
          perPage: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        new CategorySearchParams({
          page: 2,
          perPage: 2,
          filter: 'TEST',
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[3]],
          total: 3,
          currentPage: 2,
          perPage: 2,
        }).toJSON(true),
      );
    });

    it('should apply paginate and sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'createdAt']);

      const categories = [
        Category.fake().aCategory().withName('b').build(),
        Category.fake().aCategory().withName('a').build(),
        Category.fake().aCategory().withName('d').build(),
        Category.fake().aCategory().withName('e').build(),
        Category.fake().aCategory().withName('c').build(),
      ];

      await repository.bulkInsert(categories);

      const arrange = [
        {
          params: new CategorySearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
          }),
          result: new CategorySearchResult({
            items: [categories[1], categories[0]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
          }),
          result: new CategorySearchResult({
            items: [categories[4], categories[2]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          result: new CategorySearchResult({
            items: [categories[3], categories[2]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          result: new CategorySearchResult({
            items: [categories[4], categories[0]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const categories = [
        Category.fake().aCategory().withName('test').build(),
        Category.fake().aCategory().withName('a').build(),
        Category.fake().aCategory().withName('TEST').build(),
        Category.fake().aCategory().withName('e').build(),
        Category.fake().aCategory().withName('TeSt').build(),
      ];

      const arrange = [
        {
          params: new CategorySearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          result: new CategorySearchResult({
            items: [categories[2], categories[4]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          result: new CategorySearchResult({
            items: [categories[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(categories);
      });

      test.each(arrange)(
        'when value is %$searchParams',
        async ({ params, result }) => {
          const searchOutput = await repository.search(params);
          expect(searchOutput.toJSON(true)).toMatchObject(result.toJSON(true));
        },
      );
    });
  });
});

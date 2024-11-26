import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoriesIdExistsInDatabaseValidator } from './categories-id-exists-in-database.validator';
import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('CategoriesIdExistsInDatabaseValidator Unit Tests', () => {
  let categoriesRepository: CategoryInMemoryRepository;
  let validator: CategoriesIdExistsInDatabaseValidator;

  beforeEach(() => {
    categoriesRepository = new CategoryInMemoryRepository();
    validator = new CategoriesIdExistsInDatabaseValidator(categoriesRepository);
  });

  it('should return many not found errors when categories ID do not exist in database', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();

    const spyExistsById = jest.spyOn(categoriesRepository, 'existsById');

    let [categoriesId, errorsCategoriesId] = await validator.validate([
      categoryId1.id,
      categoryId2.id,
    ]);

    expect(categoriesId).toEqual(null);

    expect(errorsCategoriesId).toStrictEqual([
      new NotFoundError(categoryId1.id, Category),
      new NotFoundError(categoryId2.id, Category),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const category1 = Category.fake().aCategory().build();
    await categoriesRepository.insert(category1);

    [categoriesId, errorsCategoriesId] = await validator.validate([
      category1.categoryID.id,
      categoryId2.id,
    ]);

    expect(categoriesId).toEqual(null);

    expect(errorsCategoriesId).toStrictEqual([
      new NotFoundError(categoryId2.id, Category),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of categories ID', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();

    await categoriesRepository.bulkInsert([category1, category2]);

    const [categoriesId, errorsCategoriesId] = await validator.validate([
      category1.categoryID.id,
      category2.categoryID.id,
    ]);

    expect(categoriesId).toHaveLength(2);

    expect(errorsCategoriesId).toStrictEqual(null);

    expect(categoriesId[0]).toBeValueObject(category1.categoryID);
    expect(categoriesId[1]).toBeValueObject(category2.categoryID);
  });
});

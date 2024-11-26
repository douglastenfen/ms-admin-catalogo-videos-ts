import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { CreateGenreUseCase } from '../create-genre.use-case';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Category } from '@core/category/domain/category.aggregate';

describe('CreateGenreUseCase Unit Tests', () => {
  let useCase: CreateGenreUseCase;
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let categoriesIdExistsInDbValidator: CategoriesIdExistsInDatabaseValidator;
  let uow: UnitOfWorkFakeInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    categoriesIdExistsInDbValidator = new CategoriesIdExistsInDatabaseValidator(
      categoryRepository,
    );
    useCase = new CreateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoriesIdExistsInDbValidator,
    );
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories id not exists', async () => {
      expect.assertions(3);

      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdExistsInDbValidator,
        'validate',
      );

      try {
        await useCase.execute({
          name: 'test',
          categoriesId: [
            '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
            '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
          ],
        });
      } catch (e) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
          '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
        ]);

        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.error).toStrictEqual([
          {
            categoriesId: [
              'Category Not Found using ID 4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
              'Category Not Found using ID 7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
            ],
          },
        ]);
      }
    });

    it('should create a genre', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepository.bulkInsert([category1, category2]);

      const spyInsert = jest.spyOn(genreRepository, 'insert');
      const spyUowDo = jest.spyOn(uow, 'do');

      let output = await useCase.execute({
        name: 'test',
        categoriesId: [category1.categoryID.id, category2.categoryID.id],
      });

      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyInsert).toHaveBeenCalledTimes(1);

      expect(output).toStrictEqual({
        genreId: genreRepository.items[0].genreId.id,
        name: 'test',
        categories: [category1, category2].map((c) => ({
          categoryId: c.categoryID.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
        categoriesId: [category1.categoryID.id, category2.categoryID.id],
        isActive: true,
        createdAt: genreRepository.items[0].createdAt,
      });

      output = await useCase.execute({
        name: 'test',
        categoriesId: [category1.categoryID.id, category2.categoryID.id],
        isActive: false,
      });

      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(spyInsert).toHaveBeenCalledTimes(2);

      expect(output).toStrictEqual({
        genreId: genreRepository.items[1].genreId.id,
        name: 'test',
        categories: [category1, category2].map((c) => ({
          categoryId: c.categoryID.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
        categoriesId: [category1.categoryID.id, category2.categoryID.id],
        isActive: false,
        createdAt: genreRepository.items[1].createdAt,
      });
    });
  });
});

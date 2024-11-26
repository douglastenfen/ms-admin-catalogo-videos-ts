import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { UpdateGenreInput } from '../update-genre.input';
import { UpdateGenreUseCase } from '../update-genre.use-case';

describe('UpdateGenreUseCase Unit Tests', () => {
  let useCase: UpdateGenreUseCase;
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let categoriesIdsExistsInDbValidator: CategoriesIdExistsInDatabaseValidator;
  let uow: UnitOfWorkFakeInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    categoriesIdsExistsInDbValidator =
      new CategoriesIdExistsInDatabaseValidator(categoryRepository);
    useCase = new UpdateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoriesIdsExistsInDbValidator,
    );
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories id not exists', async () => {
      expect.assertions(3);
      const genre = Genre.fake().aGenre().build();
      await genreRepository.insert(genre);
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdsExistsInDbValidator,
        'validate',
      );
      try {
        await useCase.execute(
          new UpdateGenreInput({
            genreId: genre.genreId.id,
            name: 'test',
            categoriesId: [
              '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
              '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
            ],
          }),
        );
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

    it('should update a genre', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepository.bulkInsert([category1, category2]);
      const genre1 = Genre.fake()
        .aGenre()
        .addCategoriesId(category1.categoryID)
        .addCategoriesId(category2.categoryID)
        .build();
      await genreRepository.insert(genre1);
      const spyUpdate = jest.spyOn(genreRepository, 'update');
      const spyUowDo = jest.spyOn(uow, 'do');
      let output = await useCase.execute(
        new UpdateGenreInput({
          genreId: genre1.genreId.id,
          name: 'test',
          categoriesId: [category1.categoryID.id],
        }),
      );
      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        genreId: genreRepository.items[0].genreId.id,
        name: 'test',
        categories: [category1].map((e) => ({
          categoryId: e.categoryID.id,
          name: e.name,
          createdAt: e.createdAt,
        })),
        categoriesId: [category1.categoryID.id],
        isActive: true,
        createdAt: genreRepository.items[0].createdAt,
      });

      output = await useCase.execute({
        genreId: genre1.genreId.id,
        name: 'test',
        categoriesId: [category1.categoryID.id, category2.categoryID.id],
        isActive: false,
      });
      expect(spyUpdate).toHaveBeenCalledTimes(2);
      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(output).toStrictEqual({
        genreId: genreRepository.items[0].genreId.id,
        name: 'test',
        categoriesId: [category1.categoryID.id, category2.categoryID.id],
        categories: [category1, category2].map((e) => ({
          categoryId: e.categoryID.id,
          name: e.name,
          createdAt: e.createdAt,
        })),
        isActive: false,
        createdAt: genreRepository.items[0].createdAt,
      });
    });
  });
});

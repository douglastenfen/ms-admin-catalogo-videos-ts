import { Category } from '@core/category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { GetGenreUseCase } from '../get-genre.use-case';

describe('GetGenreUseCase Unit Tests', () => {
  let useCase: GetGenreUseCase;
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;

  beforeEach(() => {
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    useCase = new GetGenreUseCase(genreRepository, categoryRepository);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(() =>
      useCase.execute({ genreId: genreId.id }),
    ).rejects.toThrow(new NotFoundError(genreId.id, Genre));
  });

  it('should returns a genre', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(categories[0].categoryID)
      .addCategoriesId(categories[2].categoryID)
      .build();
    genreRepository.items = [genre];
    const spyGenreFindById = jest.spyOn(genreRepository, 'findByID');
    const spyCategoryFindByIds = jest.spyOn(categoryRepository, 'findByIds');
    const output = await useCase.execute({ genreId: genre.genreId.id });
    expect(spyGenreFindById).toHaveBeenCalledTimes(1);
    expect(spyCategoryFindByIds).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      genreId: genre.genreId.id,
      name: genre.name,
      categories: [
        {
          categoryId: categories[0].categoryID.id,
          name: categories[0].name,
          createdAt: categories[0].createdAt,
        },
        {
          categoryId: categories[2].categoryID.id,
          name: categories[2].name,
          createdAt: categories[2].createdAt,
        },
      ],
      categoriesId: [...genre.categoriesId.keys()],
      isActive: true,
      createdAt: genre.createdAt,
    });
  });
});

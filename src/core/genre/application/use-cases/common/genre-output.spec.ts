import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreOutputMapper } from './genre-output';

describe('GenreOutputMapper Unit Tests', () => {
  it('should convert a genre entity to a genre output', () => {
    const categories = Category.fake().theCategories(2).build();

    const createdAt = new Date();

    const entity = Genre.fake()
      .aGenre()
      .withName('test')
      .addCategoriesId(categories[0].categoryID)
      .addCategoriesId(categories[1].categoryID)
      .withCreatedAt(createdAt)
      .build();

    const output = GenreOutputMapper.toOutput(entity, categories);

    expect(output).toStrictEqual({
      genreId: entity.genreId.id,
      name: 'test',
      categories: [
        {
          categoryId: categories[0].categoryID.id,
          name: categories[0].name,
          createdAt: categories[0].createdAt,
        },
        {
          categoryId: categories[1].categoryID.id,
          name: categories[1].name,
          createdAt: categories[1].createdAt,
        },
      ],
      categoriesId: [categories[0].categoryID.id, categories[1].categoryID.id],
      isActive: entity.isActive,
      createdAt,
    });
  });
});

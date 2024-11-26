import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';

export type GenreCategoryOutput = {
  categoryId: string;
  name: string;
  createdAt: Date;
};

export type GenreOutput = {
  genreId: string;
  name: string;
  categories: GenreCategoryOutput[];
  categoriesId: string[];
  isActive: boolean;
  createdAt: Date;
};

export class GenreOutputMapper {
  static toOutput(entity: Genre, categories: Category[]): GenreOutput {
    return {
      genreId: entity.genreId.id,
      name: entity.name,
      categories: categories.map((category) => ({
        categoryId: category.categoryID.id,
        name: category.name,
        createdAt: category.createdAt,
      })),
      categoriesId: categories.map((category) => category.categoryID.id),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }
}

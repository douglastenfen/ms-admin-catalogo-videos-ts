import { CategoryId } from '@core/category/domain/category.aggregate';
import { Notification } from '@core/shared/domain/validators/notification';
import { GenreCategoryModel, GenreModel } from './genre.model';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';

export class GenreModelMapper {
  static toEntity(model: GenreModel) {
    const {
      genreId: id,
      categoriesId: categories = [],
      ...otherData
    } = model.toJSON();

    const categoriesId = categories.map(
      (category) => new CategoryId(category.categoryId),
    );

    const notification = new Notification();

    if (!categoriesId.length) {
      notification.addError('categoriesId should not be empty', 'categoriesId');
    }

    const genre = new Genre({
      ...otherData,
      genreId: new GenreId(id),
      categoriesId: new Map(
        categoriesId.map((category) => [category.id, category]),
      ),
    });

    genre.validate();

    notification.copyErrors(genre.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return genre;
  }

  static toModelProps(aggregate: Genre) {
    const { categoriesId, ...otherData } = aggregate.toJSON();

    return {
      ...otherData,
      categoriesId: categoriesId.map(
        (categoryId) =>
          new GenreCategoryModel({
            genreId: aggregate.genreId.id,
            categoryId: categoryId,
          }),
      ),
    };
  }
}

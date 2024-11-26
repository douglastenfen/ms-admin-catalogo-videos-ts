import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class CategoriesIdExistsInDatabaseValidator {
  constructor(private categoryRepository: ICategoryRepository) {}

  async validate(
    categoriesId: string[],
  ): Promise<Either<CategoryId[], NotFoundError[]>> {
    const categoriesIdFormatted = categoriesId.map((id) => new CategoryId(id));

    const existsResult = await this.categoryRepository.existsById(
      categoriesIdFormatted,
    );

    return existsResult.notExists.length > 0
      ? Either.fail(
          existsResult.notExists.map(
            (ne) => new NotFoundError(ne.id, Category),
          ),
        )
      : Either.ok(categoriesIdFormatted);
  }
}

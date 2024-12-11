import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output';
import { CreateGenreInput } from './create-genre.input';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
    private categoriesIdExistsInDb: CategoriesIdExistsInDatabaseValidator,
  ) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const [categoriesId, errorsCategoriesId] = (
      await this.categoriesIdExistsInDb.validate(input.categoriesId)
    ).asArray();

    const { name, isActive } = input;

    const entity = Genre.create({
      name,
      categoriesId: errorsCategoriesId ? [] : categoriesId,
      isActive,
    });

    const notification = entity.notification;

    if (errorsCategoriesId) {
      notification.setError(
        errorsCategoriesId.map((error) => error.message),
        'categoriesId',
      );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepository.insert(entity);
    });

    const categories = await this.categoryRepository.findByIds(
      Array.from(entity.categoriesId.values()),
    );

    return GenreOutputMapper.toOutput(entity, categories);
  }
}
export type CreateGenreOutput = GenreOutput;

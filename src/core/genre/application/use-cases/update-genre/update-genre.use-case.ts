import { IUseCase } from '@core/shared/application/use-case.interface';
import { UpdateGenreInput } from './update-genre.input';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
    private categoriesIdExistsInDb: CategoriesIdExistsInDatabaseValidator,
  ) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const genreId = new GenreId(input.genreId);
    const genre = await this.genreRepository.findByID(genreId);

    if (!genre) {
      throw new NotFoundError(input.genreId, Genre);
    }

    input.name && genre.changeName(input.name);

    if (input.isActive === true) {
      genre.activate();
    }

    if (input.isActive === false) {
      genre.deactivate();
    }

    const notification = genre.notification;

    if (input.categoriesId) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdExistsInDb.validate(input.categoriesId)
      ).asArray();

      categoriesId && genre.syncCategoriesId(categoriesId);

      errorsCategoriesId &&
        notification.setError(
          errorsCategoriesId.map((error) => error.message),
          'categoriesId',
        );
    }

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepository.update(genre);
    });

    const categories = await this.categoryRepository.findByIds(
      Array.from(genre.categoriesId.values()),
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type UpdateGenreOutput = GenreOutput;

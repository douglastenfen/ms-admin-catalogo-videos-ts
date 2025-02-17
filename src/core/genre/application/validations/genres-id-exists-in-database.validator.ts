import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class GenresIdExistsInDatabaseValidator {
  constructor(private genreRepository: IGenreRepository) {}

  async validate(
    genresId: string[],
  ): Promise<Either<GenreId[], NotFoundError[]>> {
    const genresIdFormatted = genresId.map((id) => new GenreId(id));

    const existsResult =
      await this.genreRepository.existsById(genresIdFormatted);

    return existsResult.notExists.length > 0
      ? Either.fail(
          existsResult.notExists.map((ne) => new NotFoundError(ne.id, Genre)),
        )
      : Either.ok(genresIdFormatted);
  }
}

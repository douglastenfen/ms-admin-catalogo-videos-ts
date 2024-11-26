import { IUseCase } from '@core/shared/application/use-case.interface';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class GetGenreUseCase
  implements IUseCase<GetGenreInput, GetGenreOutput>
{
  constructor(
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: GetGenreInput): Promise<GenreOutput> {
    const genreId = new GenreId(input.genreId);
    const genre = await this.genreRepository.findByID(genreId);

    if (!genre) {
      throw new NotFoundError(input.genreId, Genre);
    }

    const categories = await this.categoryRepository.findByIds([
      ...genre.categoriesId.values(),
    ]);

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type GetGenreInput = {
  genreId: string;
};

export type GetGenreOutput = GenreOutput;

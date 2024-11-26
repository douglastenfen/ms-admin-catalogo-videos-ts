import { GenreId } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';

export class DeleteGenreUseCase
  implements IUseCase<DeleteGenreInput, DeleteGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepository: IGenreRepository,
  ) {}

  async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
    const genreId = new GenreId(input.genreId);

    return this.uow.do(async () => {
      return this.genreRepository.delete(genreId);
    });
  }
}

export type DeleteGenreInput = {
  genreId: string;
};

type DeleteGenreOutput = void;

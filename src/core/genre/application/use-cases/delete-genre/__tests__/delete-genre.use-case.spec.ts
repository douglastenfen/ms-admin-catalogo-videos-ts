import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { DeleteGenreUseCase } from '../delete-genre.use-case';

describe('DeleteGenreUseCase Unit Tests', () => {
  let useCase: DeleteGenreUseCase;
  let genreRepository: GenreInMemoryRepository;
  let uow: UnitOfWorkFakeInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    genreRepository = new GenreInMemoryRepository();
    useCase = new DeleteGenreUseCase(uow, genreRepository);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();

    await expect(() =>
      useCase.execute({ genreId: genreId.id }),
    ).rejects.toThrow(new NotFoundError(genreId.id, Genre));
  });

  it('should delete a genre', async () => {
    const items = [Genre.fake().aGenre().build()];
    genreRepository.items = items;
    const spyOnDo = jest.spyOn(uow, 'do');
    await useCase.execute({
      genreId: items[0].genreId.id,
    });
    expect(spyOnDo).toHaveBeenCalledTimes(1);
    expect(genreRepository.items).toHaveLength(0);
  });
});

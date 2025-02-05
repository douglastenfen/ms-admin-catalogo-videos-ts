import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GenresIdExistsInDatabaseValidator } from './genres-id-exists-in-database.validator';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('GenresIdExistsInDatabaseValidator Unit Tests', () => {
  let genreRepository: GenreInMemoryRepository;
  let validator: GenresIdExistsInDatabaseValidator;

  beforeEach(() => {
    genreRepository = new GenreInMemoryRepository();
    validator = new GenresIdExistsInDatabaseValidator(genreRepository);
  });

  it('should return many not found errors when genres ID do not exist in database', async () => {
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();

    const spyExistsById = jest.spyOn(genreRepository, 'existsById');

    let [genresId, errorsGenresId] = await validator.validate([
      genreId1.id,
      genreId2.id,
    ]);

    expect(genresId).toEqual(null);

    expect(errorsGenresId).toStrictEqual([
      new NotFoundError(genreId1.id, Genre),
      new NotFoundError(genreId2.id, Genre),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const genre1 = Genre.fake().aGenre().build();
    await genreRepository.insert(genre1);

    [genresId, errorsGenresId] = await validator.validate([
      genre1.genreId.id,
      genreId2.id,
    ]);

    expect(genresId).toEqual(null);

    expect(errorsGenresId).toStrictEqual([
      new NotFoundError(genreId2.id, Genre),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of genres ID', async () => {
    const genre1 = Genre.fake().aGenre().build();
    const genre2 = Genre.fake().aGenre().build();

    await genreRepository.bulkInsert([genre1, genre2]);

    const [genresId, errorsGenresId] = await validator.validate([
      genre1.genreId.id,
      genre2.genreId.id,
    ]);

    expect(genresId).toHaveLength(2);

    expect(errorsGenresId).toStrictEqual(null);

    expect(genresId[0]).toBeValueObject(genre1.genreId);
    expect(genresId[1]).toBeValueObject(genre2.genreId);
  });
});

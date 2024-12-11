import { CreateGenreOutput } from '@core/genre/application/use-cases/create-genre/create-genre.use-case';
import { GenresController } from '../genres.controller';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { GenreCollectionPresenter, GenrePresenter } from '../genres.presenter';
import { UpdateGenreOutput } from '@core/genre/application/use-cases/update-genre/update-genre.use-case';
import { UpdateGenreDto } from '../dto/update-genre.dto';
import { GetGenreOutput } from '@core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresOutput } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';
import { SortDirection } from '@core/shared/domain/repository/search-params';

describe('GenresController Unit Tests', () => {
  let controller: GenresController;

  beforeEach(async () => {
    controller = new GenresController();
  });

  it('should create a genre', async () => {
    const output: CreateGenreOutput = {
      genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
      name: 'action',
      categories: [
        {
          categoryId: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
          name: 'category',
          createdAt: new Date(),
        },
      ],
      isActive: true,
      categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      createdAt: new Date(),
    };

    const mockCreateGenreUseCase = {
      execute: jest.fn().mockResolvedValue(output),
    };

    // @ts-expect-error defined part of method
    controller['createGenreUseCase'] = mockCreateGenreUseCase;

    const input: CreateGenreDto = {
      name: 'action',
      categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
    };

    const presenter = await controller.create(input);

    expect(mockCreateGenreUseCase.execute).toHaveBeenCalledWith(input);

    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should get a category', async () => {
    const genreId = '9366b7dc-2d71-4799-b91c-c64adb205104';

    const output: GetGenreOutput = {
      genreId,
      name: 'action',
      categories: [
        {
          categoryId: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
          name: 'category',
          createdAt: new Date(),
        },
      ],
      isActive: true,
      categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      createdAt: new Date(),
    };

    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    //@ts-expect-error defined part of methods
    controller['getGenreUseCase'] = mockGetUseCase;

    const presenter = await controller.findOne(genreId);

    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ genreId });

    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should list categories', async () => {
    const output: ListGenresOutput = {
      items: [
        {
          genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
          name: 'action',
          categories: [
            {
              categoryId: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
              name: 'category',
              createdAt: new Date(),
            },
          ],
          isActive: true,
          categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
          createdAt: new Date(),
        },
      ],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    };

    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    //@ts-expect-error defined part of methods
    controller['listGenresUseCase'] = mockListUseCase;

    const searchParams = {
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'desc' as SortDirection,
      filter: { name: 'actor test' },
    };

    const presenter = await controller.search(searchParams);

    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);

    expect(presenter).toBeInstanceOf(GenreCollectionPresenter);
    expect(presenter).toEqual(new GenreCollectionPresenter(output));
  });

  it('should update a genre', async () => {
    const genreId = '9366b7dc-2d71-4799-b91c-c64adb205104';

    const output: UpdateGenreOutput = {
      genreId,
      name: 'action',
      categories: [
        {
          categoryId: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
          name: 'category',
          createdAt: new Date(),
        },
      ],
      isActive: true,
      categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      createdAt: new Date(),
    };

    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    // @ts-expect-error defined part of method
    controller['updateGenreUseCase'] = mockUpdateUseCase;

    const input: UpdateGenreDto = {
      name: 'action',
      categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
    };
    const presenter = await controller.update(genreId, input);

    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
      genreId,
      ...input,
    });

    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should delete a category', async () => {
    const expectedOutput = undefined;

    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };

    //@ts-expect-error defined part of methods
    controller['deleteGenreUseCase'] = mockDeleteUseCase;

    const genreId = '9366b7dc-2d71-4799-b91c-c64adb205104';

    expect(controller.remove(genreId)).toBeInstanceOf(Promise);

    const output = await controller.remove(genreId);

    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ genreId });

    expect(expectedOutput).toStrictEqual(output);
  });
});

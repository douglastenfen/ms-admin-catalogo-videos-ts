import { Category } from '@core/category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreSearchResult } from '@core/genre/domain/genre.repository';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { GenreOutputMapper } from '../../common/genre-output';
import { ListGenresUseCase } from '../list-genres.use-case';

describe('ListGenresUseCase Unit Tests', () => {
  let useCase: ListGenresUseCase;
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;

  beforeEach(() => {
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    useCase = new ListGenresUseCase(genreRepository, categoryRepository);
  });

  test('toOutput method', async () => {
    let result = new GenreSearchResult({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
    });
    let output = await useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
    });

    const categories = Category.fake().theCategories(3).build();
    categoryRepository.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(categories[0].categoryID)
      .addCategoriesId(categories[1].categoryID)
      .build();

    result = new GenreSearchResult({
      items: [genre],
      total: 1,
      currentPage: 1,
      perPage: 2,
    });

    output = await useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [
        {
          genreId: genre.genreId.id,
          name: genre.name,
          categories: [
            {
              categoryId: categories[0].categoryID.id,
              name: categories[0].name,
              createdAt: categories[0].createdAt,
            },
            {
              categoryId: categories[1].categoryID.id,
              name: categories[1].name,
              createdAt: categories[1].createdAt,
            },
          ],
          categoriesId: [
            categories[0].categoryID.id,
            categories[1].categoryID.id,
          ],
          isActive: genre.isActive,
          createdAt: genre.createdAt,
        },
      ],
      total: 1,
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
    });
  });

  it('should search sorted by createdAt when input param is empty', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);
    const genres = [
      Genre.fake().aGenre().addCategoriesId(categories[0].categoryID).build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[1].categoryID)
        .withCreatedAt(new Date(new Date().getTime() + 100))
        .build(),
    ];
    await genreRepository.bulkInsert(genres);

    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [
        GenreOutputMapper.toOutput(genres[1], [categories[1]]),
        GenreOutputMapper.toOutput(genres[0], [categories[0]]),
      ],
      total: 2,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    });
  });

  it('should search applying paginate and filter by name', async () => {
    const categories = Category.fake().theCategories(6).build();
    await categoryRepository.bulkInsert(categories);
    const createdAt = new Date();
    const genres = [
      Genre.fake()
        .aGenre()
        .withName('test')
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .withCreatedAt(createdAt)
        .build(),
      Genre.fake().aGenre().withName('a').withCreatedAt(createdAt).build(),
      Genre.fake()
        .aGenre()
        .withName('TEST')
        .addCategoriesId(categories[1].categoryID)
        .withCreatedAt(createdAt)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TeSt')
        .addCategoriesId(categories[2].categoryID)
        .addCategoriesId(categories[3].categoryID)
        .withCreatedAt(createdAt)
        .build(),
    ];
    await genreRepository.bulkInsert(genres);

    let output = await useCase.execute({
      page: 1,
      perPage: 2,
      filter: { name: 'TEST' },
    });
    expect(output).toStrictEqual({
      items: [
        GenreOutputMapper.toOutput(genres[0], [categories[0], categories[1]]),
        GenreOutputMapper.toOutput(genres[2], [categories[1]]),
      ],
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    });

    output = await useCase.execute({
      page: 2,
      perPage: 2,
      filter: { name: 'TEST' },
    });
    expect(output).toStrictEqual({
      items: [
        GenreOutputMapper.toOutput(genres[3], [categories[2], categories[3]]),
      ],
      total: 3,
      currentPage: 2,
      perPage: 2,
      lastPage: 2,
    });
  });

  it('should search applying paginate and filter by categoriesId', async () => {
    const categories = Category.fake().theCategories(4).build();
    await categoryRepository.bulkInsert(categories);

    const createdAt = new Date();
    const genres = [
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .withCreatedAt(createdAt)
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .withCreatedAt(createdAt)
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .withCreatedAt(createdAt)
        .build(),
      Genre.fake().aGenre().withCreatedAt(createdAt).build(),
    ];
    await genreRepository.bulkInsert(genres);

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          filter: { categoriesId: [categories[0].categoryID.id] },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
            GenreOutputMapper.toOutput(genres[1], [
              categories[0],
              categories[1],
            ]),
          ],
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          filter: { categoriesId: [categories[0].categoryID.id] },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
          ],
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          filter: {
            categoriesId: [
              categories[0].categoryID.id,
              categories[1].categoryID.id,
            ],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
            GenreOutputMapper.toOutput(genres[1], [
              categories[0],
              categories[1],
            ]),
          ],
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          filter: {
            categoriesId: [
              categories[0].categoryID.id,
              categories[1].categoryID.id,
            ],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
          ],
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          filter: {
            categoriesId: [
              categories[1].categoryID.id,
              categories[2].categoryID.id,
            ],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[1], [
              categories[0],
              categories[1],
            ]),
            GenreOutputMapper.toOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
          ],
          total: 2,
          currentPage: 1,
          perPage: 2,
          lastPage: 1,
        },
      },
    ];

    for (const item of arrange) {
      const output = await useCase.execute(item.input);
      expect(output).toStrictEqual(item.output);
    }
  });

  it('should search applying paginate and sort', async () => {
    const categories = Category.fake().theCategories(6).build();
    await categoryRepository.bulkInsert(categories);
    expect(genreRepository.sortableFields).toStrictEqual(['name', 'createdAt']);

    const genres = [
      Genre.fake()
        .aGenre()
        .withName('b')
        .addCategoriesId(categories[0].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('a')
        .addCategoriesId(categories[1].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('d')
        .addCategoriesId(categories[2].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('e')
        .addCategoriesId(categories[3].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('c')
        .addCategoriesId(categories[4].categoryID)
        .build(),
    ];
    await genreRepository.bulkInsert(genres);

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[1], [categories[1]]),
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
          ],
          total: 5,
          currentPage: 1,
          perPage: 2,
          lastPage: 3,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[4], [categories[4]]),
            GenreOutputMapper.toOutput(genres[2], [categories[2]]),
          ],
          total: 5,
          currentPage: 2,
          perPage: 2,
          lastPage: 3,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc' as SortDirection,
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[3], [categories[3]]),
            GenreOutputMapper.toOutput(genres[2], [categories[2]]),
          ],
          total: 5,
          currentPage: 1,
          perPage: 2,
          lastPage: 3,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc' as SortDirection,
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[4], [categories[4]]),
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
          ],
          total: 5,
          currentPage: 2,
          perPage: 2,
          lastPage: 3,
        },
      },
    ];

    for (const item of arrange) {
      const output = await useCase.execute(item.input);
      expect(output).toStrictEqual(item.output);
    }
  });

  describe('should search applying filter by name, sort and paginate', () => {
    const categories = Category.fake().theCategories(6).build();

    const genres = [
      Genre.fake()
        .aGenre()
        .withName('test')
        .addCategoriesId(categories[0].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('a')
        .addCategoriesId(categories[1].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TEST')
        .addCategoriesId(categories[2].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('e')
        .addCategoriesId(categories[3].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TeSt')
        .addCategoriesId(categories[4].categoryID)
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [categories[2]]),
            GenreOutputMapper.toOutput(genres[4], [categories[4]]),
          ],
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [GenreOutputMapper.toOutput(genres[0], [categories[0]])],
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)(
      'when input is {"filter": $input.filter, "page": $input.page, "perPage": $input.perPage, "sort": $input.sort, "sortDir": $input.sortDir}',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });

  describe('should search applying filter by categoriesId, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const genres = [
      Genre.fake()
        .aGenre()
        .withName('test')
        .addCategoriesId(categories[0].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('a')
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TEST')
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('e')
        .addCategoriesId(categories[3].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TeSt')
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { categoriesId: [categories[0].categoryID.id] },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
            GenreOutputMapper.toOutput(genres[1], [
              categories[0],
              categories[1],
            ]),
          ],
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { categoriesId: [categories[0].categoryID.id] },
        },
        output: {
          items: [GenreOutputMapper.toOutput(genres[0], [categories[0]])],
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { categoriesId: [categories[1].categoryID.id] },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
            GenreOutputMapper.toOutput(genres[4], [
              categories[1],
              categories[2],
            ]),
          ],
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { categoriesId: [categories[1].categoryID.id] },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[1], [
              categories[0],
              categories[1],
            ]),
          ],
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: {
            categoriesId: [
              categories[0].categoryID.id,
              categories[1].categoryID.id,
            ],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
            GenreOutputMapper.toOutput(genres[4], [
              categories[1],
              categories[2],
            ]),
          ],
          total: 4,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: {
            categoriesId: [
              categories[0].categoryID.id,
              categories[1].categoryID.id,
            ],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[1], [
              categories[0],
              categories[1],
            ]),
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
          ],
          total: 4,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)(
      'when input is {"filter": $input.filter, "page": $input.page, "perPage": $input.perPage, "sort": $input.sort, "sortDir": $input.sortDir}',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });

  describe('should search applying filter by name and categoriesId, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const genres = [
      Genre.fake()
        .aGenre()
        .withName('test')
        .addCategoriesId(categories[0].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('a')
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TEST')
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('e')
        .addCategoriesId(categories[3].categoryID)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('TeSt')
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: {
            name: 'TEST',
            categoriesId: [categories[0].categoryID.id],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
          ],
          total: 2,
          currentPage: 1,
          perPage: 2,
          lastPage: 1,
        },
      },
      {
        input: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: {
            name: 'TEST',
            categoriesId: [
              categories[0].categoryID.id,
              categories[1].categoryID.id,
            ],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [
              categories[0],
              categories[1],
              categories[2],
            ]),
            GenreOutputMapper.toOutput(genres[4], [
              categories[1],
              categories[2],
            ]),
          ],
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      },
      {
        input: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: {
            name: 'TEST',
            categoriesId: [
              categories[0].categoryID.id,
              categories[1].categoryID.id,
            ],
          },
        },
        output: {
          items: [GenreOutputMapper.toOutput(genres[0], [categories[0]])],
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)(
      'when input is {"filter": $input.filter, "page": $input.page, "perPage": $input.perPage, "sort": $input.sort, "sortDir": $input.sortDir}',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });
});

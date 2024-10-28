import { Category } from '../../../../domain/category.entity';
import { CategorySearchResult } from '../../../../domain/category.repository';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { CategoryOutputMapper } from '../../common/category-output';
import { ListCategoriesUseCase } from '../list-categories.use-case';

describe('ListCategoriesUseCase Unit Test', () => {
  let useCase: ListCategoriesUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new ListCategoriesUseCase(repository);
  });

  test('output method', () => {
    let result = new CategorySearchResult({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
    });

    let output = useCase['toOutput'](result);

    expect(output).toStrictEqual({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
    });

    const category = Category.create({ name: 'Movie' });

    result = new CategorySearchResult({
      items: [category],
      total: 1,
      currentPage: 1,
      perPage: 2,
    });

    output = useCase['toOutput'](result);

    expect(output).toStrictEqual({
      items: [category].map(CategoryOutputMapper.toOutput),
      total: 1,
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
    });
  });

  it('should return output sorted by createdAt when input is empty', async () => {
    const items = [
      new Category({ name: 'Movie' }),
      new Category({
        name: 'Music',
        createdAt: new Date(new Date().getTime() + 100),
      }),
    ];

    repository.items = items;

    const output = await useCase.execute({});

    expect(output).toStrictEqual({
      items: [...items].reverse().map(CategoryOutputMapper.toOutput),
      total: 2,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    });
  });
});

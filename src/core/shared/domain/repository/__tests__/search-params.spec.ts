import { SearchParams } from '../search-params';

describe('SearchParams Unit Tests', () => {
  test('page prop', () => {
    const params = new SearchParams();

    expect(params.page).toBe(1);

    const arrange = [
      { page: null, expected: 1 },
      { page: undefined, expected: 1 },
      { page: '', expected: 1 },
      { page: 'fake', expected: 1 },
      { page: 0, expected: 1 },
      { page: -1, expected: 1 },
      { page: 5.5, expected: 1 },
      { page: true, expected: 1 },
      { page: false, expected: 1 },
      { page: {}, expected: 1 },

      { page: 1, expected: 1 },
      { page: 2, expected: 2 },
    ];

    arrange.forEach((item) => {
      expect(new SearchParams({ page: item.page as any }).page).toBe(
        item.expected
      );
    });
  });

  test('perPage prop', () => {
    const params = new SearchParams();

    expect(params.perPage).toBe(15);

    const arrange = [
      { perPage: null, expected: 15 },
      { perPage: undefined, expected: 15 },
      { perPage: '', expected: 15 },
      { perPage: 'fake', expected: 15 },
      { perPage: 0, expected: 15 },
      { perPage: -1, expected: 15 },
      { perPage: 5.5, expected: 15 },
      { perPage: true, expected: 15 },
      { perPage: false, expected: 15 },
      { perPage: {}, expected: 15 },

      { perPage: 1, expected: 1 },
      { perPage: 2, expected: 2 },
      { perPage: 10, expected: 10 },
    ];

    arrange.forEach((item) => {
      expect(new SearchParams({ perPage: item.perPage as any }).perPage).toBe(
        item.expected
      );
    });
  });

  test('sort prop', () => {
    const params = new SearchParams();

    expect(params.sort).toBe(null);

    const arrange = [
      { sort: null, expected: null },
      { sort: undefined, expected: null },
      { sort: '', expected: null },
      { sort: 'fake', expected: 'fake' },
      { sort: 0, expected: '0' },
      { sort: -1, expected: '-1' },
      { sort: 5.5, expected: '5.5' },
      { sort: true, expected: 'true' },
      { sort: false, expected: 'false' },
      { sort: {}, expected: '[object Object]' },
      { sort: 'field', expected: 'field' },
    ];

    arrange.forEach((item) => {
      expect(new SearchParams({ sort: item.sort as any }).sort).toBe(
        item.expected
      );
    });
  });

  test('sortDir prop', () => {
    let params = new SearchParams();
    expect(params.sortDir).toBeNull();

    params = new SearchParams({ sort: null });
    expect(params.sortDir).toBeNull();

    params = new SearchParams({ sort: undefined });
    expect(params.sortDir).toBeNull();

    params = new SearchParams({ sort: '' });
    expect(params.sortDir).toBeNull();

    const arrange = [
      { sortDir: null, expected: 'asc' },
      { sortDir: undefined, expected: 'asc' },
      { sortDir: 0, expected: 'asc' },
      { sortDir: 'fake', expected: 'asc' },

      { sortDir: 'asc', expected: 'asc' },
      { sortDir: 'ASC', expected: 'asc' },
      { sortDir: 'desc', expected: 'desc' },
      { sortDir: 'DESC', expected: 'desc' },
    ];

    arrange.forEach((item) => {
      expect(
        new SearchParams({ sort: 'field', sortDir: item.sortDir as any })
          .sortDir
      ).toBe(item.expected);
    });
  });

  test('filter prop', () => {
    const params = new SearchParams();

    expect(params.filter).toBeNull();

    const arrange = [
      { filter: null, expected: null },
      { filter: undefined, expected: null },
      { filter: '', expected: null },

      { filter: 0, expected: '0' },
      { filter: -1, expected: '-1' },
      { filter: 5.5, expected: '5.5' },
      { filter: true, expected: 'true' },
      { filter: false, expected: 'false' },
      { filter: {}, expected: '[object Object]' },
      { filter: 'field', expected: 'field' },
    ];

    arrange.forEach((item) => {
      expect(new SearchParams({ filter: item.filter as any }).filter).toEqual(
        item.expected
      );
    });
  });
});

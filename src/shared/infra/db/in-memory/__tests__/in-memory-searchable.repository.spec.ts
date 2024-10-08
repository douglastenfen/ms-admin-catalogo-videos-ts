import { Entity } from '../../../../domain/entity';
import { SearchParams } from '../../../../domain/repository/search-params';
import { SearchResult } from '../../../../domain/repository/search-result';
import { Uuid } from '../../../../domain/value-objects/uuid.vo';
import { InMemorySearchableRepository } from '../in-memory.repository';

type StubEntityConstructorProps = {
  entityID?: Uuid;
  name: string;
};

class StubEntity extends Entity {
  entityID: Uuid;
  name: string;

  constructor(props: StubEntityConstructorProps) {
    super();

    this.entityID = props.entityID || new Uuid();
    this.name = props.name;
  }

  toJSON() {
    return {
      entityID: this.entityID.id,
      name: this.name,
    };
  }
}

class StubInMemorySearchableRepository extends InMemorySearchableRepository<
  StubEntity,
  Uuid
> {
  sortableFields: string[] = ['name'];

  protected async applyFilter(
    items: StubEntity[],
    filter: string
  ): Promise<StubEntity[]> {
    if (!filter) {
      return items;
    }

    return items.filter((item) => {
      return item.name.toLowerCase().includes(filter.toLowerCase());
    });
  }

  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }
}

describe('InMemorySearchableRepository Unit Tests', () => {
  let repo: StubInMemorySearchableRepository;

  beforeEach(() => (repo = new StubInMemorySearchableRepository()));

  describe('applyFilter method', () => {
    it('should no filter items when filter param is null', async () => {
      const items = [new StubEntity({ name: 'Test 1' })];

      const spyFilterMethod = jest.spyOn(items, 'filter' as any);

      const filteredItems = await repo['applyFilter'](items, null);

      expect(spyFilterMethod).not.toHaveBeenCalled();

      expect(filteredItems).toStrictEqual(items);
    });

    it('should filter using a filter param', async () => {
      const items = [
        new StubEntity({ name: 'Test 1' }),
        new StubEntity({ name: 'TEST' }),
        new StubEntity({ name: 'fake' }),
      ];

      const spyFilterMethod = jest.spyOn(items, 'filter' as any);

      let filteredItems = await repo['applyFilter'](items, 'TEST');

      expect(spyFilterMethod).toHaveBeenCalledTimes(1);
      expect(filteredItems).toStrictEqual([items[0], items[1]]);

      filteredItems = await repo['applyFilter'](items, 'fake');

      expect(spyFilterMethod).toHaveBeenCalledTimes(2);
      expect(filteredItems).toStrictEqual([items[2]]);

      filteredItems = await repo['applyFilter'](items, 'no-filter');

      expect(spyFilterMethod).toHaveBeenCalledTimes(3);
      expect(filteredItems).toHaveLength(0);
    });
  });

  describe('applySort method', () => {
    it('should no sort items', async () => {
      const items = [
        new StubEntity({ name: 'Test 1' }),
        new StubEntity({ name: 'Test 2' }),
      ];

      let sortedItems = repo['applySort'](items, null, null);
      expect(sortedItems).toStrictEqual(items);

      sortedItems = repo['applySort'](items, 'invalid-field', null);
      expect(sortedItems).toStrictEqual(items);
    });

    it('should sort items', async () => {
      const items = [
        new StubEntity({ name: 'b' }),
        new StubEntity({ name: 'a' }),
        new StubEntity({ name: 'c' }),
      ];

      let itemsSorted = repo['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]]);

      itemsSorted = repo['applySort'](items, 'name', 'desc');
      expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);
    });
  });

  describe('applyPaginate method', () => {
    it('should paginate items', async () => {
      const items = [
        new StubEntity({ name: 'a' }),
        new StubEntity({ name: 'b' }),
        new StubEntity({ name: 'c' }),
        new StubEntity({ name: 'd' }),
        new StubEntity({ name: 'e' }),
      ];

      let paginatedItems = repo['applyPaginate'](items, 1, 2);
      expect(paginatedItems).toStrictEqual([items[0], items[1]]);

      paginatedItems = repo['applyPaginate'](items, 2, 2);
      expect(paginatedItems).toStrictEqual([items[2], items[3]]);

      paginatedItems = repo['applyPaginate'](items, 3, 2);
      expect(paginatedItems).toStrictEqual([items[4]]);

      paginatedItems = repo['applyPaginate'](items, 4, 2);
      expect(paginatedItems).toStrictEqual([]);
    });
  });

  describe('search method', () => {
    it('should apply only paginate when other params are null', async () => {
      const entity = new StubEntity({ name: 'Test' });
      const items = Array(16).fill(entity);
      repo.items = items;

      const result = await repo.search(new SearchParams());

      expect(result).toStrictEqual(
        new SearchResult({
          items: Array(15).fill(entity),
          total: 16,
          currentPage: 1,
          perPage: 15,
        })
      );
    });

    it('should apply paginate and filter', async () => {
      const items = [
        new StubEntity({ name: 'test' }),
        new StubEntity({ name: 'a' }),
        new StubEntity({ name: 'TEST' }),
        new StubEntity({ name: 'TeSt' }),
      ];

      repo.items = items;

      let result = await repo.search(
        new SearchParams({ page: 1, perPage: 2, filter: 'TEST' })
      );

      expect(result).toStrictEqual(
        new SearchResult({
          items: [items[0], items[2]],
          total: 3,
          currentPage: 1,
          perPage: 2,
        })
      );

      result = await repo.search(
        new SearchParams({ page: 2, perPage: 2, filter: 'TEST' })
      );

      expect(result).toStrictEqual(
        new SearchResult({
          items: [items[3]],
          total: 3,
          currentPage: 2,
          perPage: 2,
        })
      );
    });

    describe('should apply paginate and sort', () => {
      const items = [
        new StubEntity({ name: 'b' }),
        new StubEntity({ name: 'a' }),
        new StubEntity({ name: 'd' }),
        new StubEntity({ name: 'e' }),
        new StubEntity({ name: 'c' }),
      ];
      const arrange = [
        {
          searchParams: new SearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
          }),
          searchResult: new SearchResult({
            items: [items[1], items[0]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          searchParams: new SearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
          }),
          searchResult: new SearchResult({
            items: [items[4], items[2]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
        {
          searchParams: new SearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          searchResult: new SearchResult({
            items: [items[3], items[2]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          searchParams: new SearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          searchResult: new SearchResult({
            items: [items[4], items[0]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      beforeEach(() => {
        repo.items = items;
      });

      test.each(arrange)(
        'when value is %j',
        async ({ searchParams, searchResult }) => {
          const result = await repo.search(searchParams);
          expect(result).toStrictEqual(searchResult);
        }
      );
    });

    it('should search using filters, sort and paginate', async () => {
      const items = [
        new StubEntity({ name: 'test' }),
        new StubEntity({ name: 'a' }),
        new StubEntity({ name: 'TEST' }),
        new StubEntity({ name: 'e' }),
        new StubEntity({ name: 'TeSt' }),
      ];

      repo.items = items;

      const arrange = [
        {
          params: new SearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          result: new SearchResult({
            items: [items[2], items[4]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          }),
        },

        {
          params: new SearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          result: new SearchResult({
            items: [items[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await repo.search(i.params);

        expect(result).toStrictEqual(i.result);
      }
    });
  });
});

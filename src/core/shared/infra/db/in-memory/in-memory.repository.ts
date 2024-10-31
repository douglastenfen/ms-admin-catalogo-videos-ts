import { Entity } from '../../../domain/entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import {
  IRepository,
  ISearchableRepository,
} from '../../../domain/repository/repository-interface';
import {
  SearchParams,
  SortDirection,
} from '../../../domain/repository/search-params';
import { SearchResult } from '../../../domain/repository/search-result';
import { ValueObject } from '../../../domain/value-object';

export abstract class InMemoryRepository<
  E extends Entity,
  EntityID extends ValueObject,
> implements IRepository<E, EntityID>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async update(entity: E): Promise<void> {
    const indexFound = this.items.findIndex((item) =>
      item.entityID.equals(entity.entityID),
    );

    if (indexFound === -1) {
      throw new NotFoundError(entity.entityID, this.getEntity());
    }

    this.items[indexFound] = entity;
  }

  async delete(entityID: EntityID): Promise<void> {
    const indexFound = this.items.findIndex((item) =>
      item.entityID.equals(entityID),
    );

    if (indexFound === -1) {
      throw new NotFoundError(entityID, this.getEntity());
    }

    this.items.splice(indexFound, 1);
  }

  async findByID(entityID: EntityID): Promise<E | null> {
    const entity = this.items.find((item) => item.entityID.equals(entityID));

    return typeof entity === 'undefined' ? null : entity;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  abstract getEntity(): new (...args: any[]) => E;
}

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityID extends ValueObject,
    Filter = string,
  >
  extends InMemoryRepository<E, EntityID>
  implements ISearchableRepository<E, EntityID, Filter>
{
  sortableFields: string[] = [];
  async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
    const filtredItems = await this.applyFilter(this.items, props.filter);

    const sortedItems = this.applySort(filtredItems, props.sort, props.sortDir);

    const paginatedItems = this.applyPaginate(
      sortedItems,
      props.page,
      props.perPage,
    );

    return new SearchResult({
      items: paginatedItems,
      total: filtredItems.length,
      currentPage: props.page,
      perPage: props.perPage,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null,
  ): Promise<E[]>;

  protected applySort(
    items: E[],
    sort: string | null,
    sortDir: SortDirection | null,
    customGetter?: (sort: string, item: E) => any,
  ) {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }

    return [...items].sort((a, b) => {
      // @ts-ignore
      const aValue = customGetter ? customGetter(sort, a) : a[sort];
      // @ts-ignore
      const bValue = customGetter ? customGetter(sort, b) : b[sort];

      if (aValue < bValue) {
        return sortDir === 'asc' ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortDir === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  protected applyPaginate(
    items: E[],
    page: SearchParams['page'],
    perPage: SearchParams['perPage'],
  ) {
    const start = (page - 1) * perPage;
    const limit = start + perPage;

    return items.slice(start, limit);
  }
}

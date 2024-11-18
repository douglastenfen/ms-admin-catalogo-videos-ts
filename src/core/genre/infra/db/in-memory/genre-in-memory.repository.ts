import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import {
  GenreFilter,
  IGenreRepository,
} from '@core/genre/domain/genre.repository';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/shared/infra/db/in-memory/in-memory.repository';

export class GenreInMemoryRepository
  extends InMemorySearchableRepository<Genre, GenreId, GenreFilter>
  implements IGenreRepository
{
  sortableFields: string[] = ['name', 'createdAt'];

  protected async applyFilter(
    items: Genre[],
    filter: GenreFilter,
  ): Promise<Genre[]> {
    if (!filter) {
      return items;
    }

    return items.filter((item) => {
      const containsName =
        filter.name &&
        item.name.toLowerCase().includes(filter.name.toLowerCase());

      const containsCategoriesId =
        filter.categoriesId &&
        filter.categoriesId.some((categoryId) =>
          item.categoriesId.has(categoryId.id),
        );

      return filter.name && filter.categoriesId
        ? containsName && containsCategoriesId
        : filter.name
          ? containsName
          : containsCategoriesId;
    });
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }

  protected applySort(
    items: Genre[],
    sort: string | null,
    sortDir: SortDirection | null,
  ) {
    return sort
      ? super.applySort(items, sort, sortDir)
      : super.applySort(items, 'createdAt', 'desc');
  }
}

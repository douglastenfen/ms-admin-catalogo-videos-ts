import { CategoryId } from '@core/category/domain/category.aggregate';
import {
  SearchParams,
  SearchParamsConstructorProps,
} from '@core/shared/domain/repository/search-params';
import { SearchResult } from '@core/shared/domain/repository/search-result';
import { Genre, GenreId } from './genre.aggregate';
import { ISearchableRepository } from '@core/shared/domain/repository/repository-interface';

export type GenreFilter = {
  name?: string;
  categoriesId?: CategoryId[];
};

export class GenreSearchParams extends SearchParams<GenreFilter> {
  private constructor(props: SearchParamsConstructorProps<GenreFilter> = {}) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<GenreFilter>, 'filter'> & {
      filter?: {
        name?: string;
        categoriesId?: CategoryId[] | string[];
      };
    } = {},
  ) {
    const categoriesId = props.filter?.categoriesId?.map((id) => {
      return id instanceof CategoryId ? id : new CategoryId(id);
    });

    return new GenreSearchParams({
      ...props,
      filter: {
        name: props.filter?.name,
        categoriesId,
      },
    });
  }

  get filter(): GenreFilter | null {
    return this._filter;
  }

  protected set filter(value: GenreFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value?.name && { name: `${_value.name}` }),
      ...(_value?.categoriesId &&
        _value?.categoriesId.length && { categoriesId: _value.categoriesId }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class GenreSearchResult extends SearchResult<Genre> {}

export interface IGenreRepository
  extends ISearchableRepository<
    Genre,
    GenreId,
    GenreFilter,
    GenreSearchParams,
    GenreSearchResult
  > {}

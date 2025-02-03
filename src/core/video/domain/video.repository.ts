import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import {
  SearchParams,
  SearchParamsConstructorProps,
} from '@core/shared/domain/repository/search-params';
import { SearchResult } from '@core/shared/domain/repository/search-result';
import { Video, VideoId } from './video.aggregate';
import { ISearchableRepository } from '@core/shared/domain/repository/repository-interface';

export type VideoFilter = {
  title?: string;
  categoriesId?: CategoryId[];
  genresId?: GenreId[];
  castMembersId?: CastMemberId[];
};

export class VideoSearchParams extends SearchParams<VideoFilter> {
  private constructor(props: SearchParamsConstructorProps<VideoFilter>) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<VideoFilter>, 'filter'> & {
      filter?: {
        title?: string;
        categoriesId?: CategoryId[];
        genresId?: GenreId[];
        castMembersId?: CastMemberId[];
      };
    } = {},
  ) {
    const categoriesId = props.filter?.categoriesId?.map((c) =>
      c instanceof CategoryId ? c : new CategoryId(c),
    );

    const genresId = props.filter?.genresId?.map((g) =>
      g instanceof GenreId ? g : new GenreId(g),
    );

    const castMembersId = props.filter?.castMembersId?.map((c) =>
      c instanceof CastMemberId ? c : new CastMemberId(c),
    );

    return new VideoSearchParams({
      ...props,
      filter: {
        title: props.filter?.title,
        categoriesId,
        genresId,
        castMembersId,
      },
    });
  }

  get filter(): VideoFilter | null {
    return this._filter;
  }

  protected set filter(value: VideoFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value?.title && { title: `${_value?.title}` }),
      ...(_value?.categoriesId &&
        _value.categoriesId.length && {
          categoriesId: _value.categoriesId,
        }),
      ...(_value?.genresId &&
        _value.genresId.length && { genresId: _value.genresId }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class VideoSearchResult extends SearchResult<Video> {}

export interface IVideoRepository
  extends ISearchableRepository<
    Video,
    VideoId,
    VideoFilter,
    VideoSearchParams,
    VideoSearchResult
  > {}

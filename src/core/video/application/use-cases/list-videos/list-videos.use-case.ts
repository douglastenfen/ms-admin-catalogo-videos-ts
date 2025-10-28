import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/shared/application/pagination-output';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import {
  IVideoRepository,
  VideoFilter,
  VideoSearchParams,
  VideoSearchResult,
} from '@core/video/domain/video.repository';
import { VideoOutput, VideoOutputMapper } from '../common/video.output';

export class ListVideosUseCase
  implements IUseCase<ListVideosInput, ListVideosOutput>
{
  constructor(
    private videoRepository: IVideoRepository,
    private categoryRepository: ICategoryRepository,
    private genreRepository: IGenreRepository,
    private castMemberRepository: ICastMemberRepository,
  ) {}

  async execute(input: ListVideosInput): Promise<ListVideosOutput> {
    const params = VideoSearchParams.create({
      ...input,
      filter: input.filter
        ? {
            title: input.filter.title,
            categoriesId: input.filter.categoriesId as any,
            genresId: input.filter.genresId as any,
            castMembersId: input.filter.castMembersId as any,
          }
        : undefined,
    });

    const searchResult = await this.videoRepository.search(params);

    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: VideoSearchResult,
  ): Promise<ListVideosOutput> {
    const { items: videos } = searchResult;

    const genresIdOfVideos = videos.flatMap((v) =>
      Array.from(v.genresId.values()),
    );
    const genres = await this.genreRepository.findByIds(genresIdOfVideos);

    const categoriesIdOfVideos = videos.flatMap((v) =>
      Array.from(v.categoriesId.values()).concat(
        genres.flatMap((g) => Array.from(g.categoriesId.values())),
      ),
    );
    const categories = await this.categoryRepository.findByIds(
      categoriesIdOfVideos,
    );

    const castMembersIdOfVideos = videos.flatMap((v) =>
      Array.from(v.castMembersId.values()),
    );
    const castMembers = await this.castMemberRepository.findByIds(
      castMembersIdOfVideos,
    );

    const items = videos.map((video) => {
      return VideoOutputMapper.toOutput({
        video,
        allCategoriesOfVideoAndGenre: categories,
        genres,
        castMembers,
      });
    });

    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListVideosInput = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: {
    title?: string;
    categoriesId?: string[];
    genresId?: string[];
    castMembersId?: string[];
  } | null;
};

export type ListVideosOutput = PaginationOutput<VideoOutput>;

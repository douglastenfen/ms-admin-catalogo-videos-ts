import { SortDirection } from '@core/shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/shared/infra/db/in-memory/in-memory.repository';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import {
  IVideoRepository,
  VideoFilter,
} from '@core/video/domain/video.repository';

export class VideoInMemoryRepository
  extends InMemorySearchableRepository<Video, VideoId, VideoFilter>
  implements IVideoRepository
{
  sortableFields: string[] = ['title', 'created_at'];

  protected async applyFilter(
    items: Video[],
    filter: VideoFilter | null,
  ): Promise<Video[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      const containsTitle =
        filter.title &&
        i.title.toLocaleLowerCase().includes(filter.title.toLocaleLowerCase());

      const containsCategoriesId =
        filter.categoriesId &&
        filter.categoriesId.some((c) => i.categoriesId.has(c.id));

      const containsGenresId =
        filter.genresId && filter.genresId.some((g) => i.genresId.has(g.id));

      const containsCastMembersId =
        filter.castMembersId &&
        filter.castMembersId.some((c) => i.castMembersId.has(c.id));

      const filterMap = [
        [filter.title, containsTitle],
        [filter.categoriesId, containsCategoriesId],
        [filter.genresId, containsGenresId],
        [filter.castMembersId, containsCastMembersId],
      ].filter((i) => i[0]);

      return filterMap.every((i) => i[1]);
    });
  }

  protected applySort(
    items: Video[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): Video[] {
    return !sort
      ? super.applySort(items, 'created_at', 'desc')
      : super.applySort(items, sort, sortDir);
  }

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }
}

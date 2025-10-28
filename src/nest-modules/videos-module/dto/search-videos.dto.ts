import { ListVideosInput } from '@core/video/application/use-cases/list-videos/list-videos.use-case';
import { SortDirection } from '@core/shared/domain/repository/search-params';

export class SearchVideosDto implements ListVideosInput {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection;
  filter?: any;
}

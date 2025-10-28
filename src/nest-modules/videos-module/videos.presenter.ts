import { VideoOutput } from '@core/video/application/use-cases/common/video.output';
import { ListVideosOutput } from '@core/video/application/use-cases/list-videos/list-videos.use-case';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/collection.presenter';

export class VideoCategoryPresenter {
  id: string;
  name: string;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;
}

export class VideoGenrePresenter {
  id: string;
  name: string;
  isActive: boolean;
  categoriesId: string[];
  categories: VideoCategoryPresenter[];
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;
}

export class VideoCastMemberPresenter {
  id: string;
  name: string;
  type: string;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;
}

export class VideoPresenter {
  id: string;
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  rating: string;
  isOpened: boolean;
  isPublished: boolean;
  categoriesId: string[];
  categories: VideoCategoryPresenter[];
  genresId: string[];
  genres: VideoGenrePresenter[];
  castMembersId: string[];
  castMembers: VideoCastMemberPresenter[];
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;

  constructor(output: VideoOutput) {
    this.id = output.id;
    this.title = output.title;
    this.description = output.description;
    this.releasedYear = output.releasedYear;
    this.duration = output.duration;
    this.rating = output.rating;
    this.isOpened = output.isOpened;
    this.isPublished = output.isPublished;
    this.categoriesId = output.categoriesId;
    this.categories = output.categories;
    this.genresId = output.genresId;
    this.genres = output.genres;
    this.castMembersId = output.castMembersId;
    this.castMembers = output.castMembers.map((cm) => ({
      ...cm,
      type: cm.type.toString(),
    }));
    this.createdAt = output.createdAt;
  }
}

export class VideoCollectionPresenter extends CollectionPresenter {
  data: VideoPresenter[];

  constructor(output: ListVideosOutput) {
    const { items, ...paginationProps } = output;

    super(paginationProps);

    this.data = items.map((item) => new VideoPresenter(item));
  }
}

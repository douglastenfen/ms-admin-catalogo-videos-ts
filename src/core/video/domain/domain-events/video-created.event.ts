import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
import { Banner } from '../banner.vo';
import { Rating } from '../rating.vo';
import { ThumbnailHalf } from '../thumbnail-half.vo';
import { Thumbnail } from '../thumbnail.vo';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { VideoId } from '../video.aggregate';

export type VideoCreatedEventProps = {
  videoId: VideoId;
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  isPublished: boolean;
  banner: Banner | null;
  thumbnail: Thumbnail | null;
  thumbnailHalf: ThumbnailHalf | null;
  trailer: Trailer | null;
  video: VideoMedia | null;
  categoriesId: CategoryId[];
  genresId: GenreId[];
  castMembersId: CastMemberId[];
  createdAt: Date;
};

export class VideoCreatedEvent implements IDomainEvent {
  readonly aggregateId: VideoId;
  readonly occurredOn: Date;
  readonly eventVersion: number;

  readonly title: string;
  readonly description: string;
  readonly releasedYear: number;
  readonly duration: number;
  readonly rating: Rating;
  readonly isOpened: boolean;
  readonly isPublished: boolean;
  readonly banner: Banner | null;
  readonly thumbnail: Thumbnail | null;
  readonly thumbnailHalf: ThumbnailHalf | null;
  readonly trailer: Trailer | null;
  readonly video: VideoMedia | null;
  readonly categoriesId: CategoryId[];
  readonly genresId: GenreId[];
  readonly castMembersId: CastMemberId[];
  readonly createdAt: Date;

  constructor(props: VideoCreatedEventProps) {
    this.aggregateId = props.videoId;
    this.title = props.title;
    this.description = props.description;
    this.releasedYear = props.releasedYear;
    this.duration = props.duration;
    this.rating = props.rating;
    this.isOpened = props.isOpened;
    this.isPublished = props.isPublished;
    this.banner = props.banner;
    this.thumbnail = props.thumbnail;
    this.thumbnailHalf = props.thumbnailHalf;
    this.trailer = props.trailer;
    this.video = props.video;
    this.categoriesId = props.categoriesId;
    this.genresId = props.genresId;
    this.castMembersId = props.castMembersId;
    this.createdAt = props.createdAt;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}

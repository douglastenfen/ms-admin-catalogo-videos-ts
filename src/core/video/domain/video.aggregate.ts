import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '@core/shared/domain/value-object';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Banner } from './banner.vo';
import { AudioVideoMediaReplacedEvent } from './domain-events/audio-video-media-replaced.event';
import { VideoCreatedEvent } from './domain-events/video-created.event';
import { Rating } from './rating.vo';
import { ThumbnailHalf } from './thumbnail-half.vo';
import { Thumbnail } from './thumbnail.vo';
import { Trailer } from './trailer.vo';
import { VideoFakeBuilder } from './video-fake.builder';
import { VideoMedia } from './video-media.vo';
import VideoValidatorFactory from './video.validator';

export type VideoConstructorProps = {
  videoId?: VideoId;
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  isPublished: boolean;
  banner?: Banner | null;
  thumbnail?: Thumbnail | null;
  thumbnailHalf?: ThumbnailHalf | null;
  trailer?: Trailer | null;
  video?: VideoMedia | null;
  categoriesId: Map<string, CategoryId>;
  genresId: Map<string, GenreId>;
  castMembersId: Map<string, CastMemberId>;
  createdAt?: Date;
};

export type VideoCreateCommand = {
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnailHalf?: ThumbnailHalf;
  trailer?: Trailer;
  video?: VideoMedia;
  categoriesId: CategoryId[];
  genresId: GenreId[];
  castMembersId: CastMemberId[];
};

export class VideoId extends Uuid {}

export class Video extends AggregateRoot {
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
  categoriesId: Map<string, CategoryId>;
  genresId: Map<string, GenreId>;
  castMembersId: Map<string, CastMemberId>;
  createdAt: Date;

  constructor(props: VideoConstructorProps) {
    super();
    this.videoId = props.videoId ?? new VideoId();
    this.title = props.title;
    this.description = props.description;
    this.releasedYear = props.releasedYear;
    this.duration = props.duration;
    this.rating = props.rating;
    this.isOpened = props.isOpened;
    this.isPublished = props.isPublished;
    this.banner = props.banner ?? null;
    this.thumbnail = props.thumbnail ?? null;
    this.thumbnailHalf = props.thumbnailHalf ?? null;
    this.trailer = props.trailer ?? null;
    this.video = props.video ?? null;
    this.categoriesId = props.categoriesId;
    this.genresId = props.genresId;
    this.castMembersId = props.castMembersId;
    this.createdAt = props.createdAt ?? new Date();

    this.registerHandler(
      VideoCreatedEvent.name,
      this.onVideoCreated.bind(this),
    );

    this.registerHandler(
      AudioVideoMediaReplacedEvent.name,
      this.onAudioVideoMediaReplaced.bind(this),
    );
  }

  static create(props: VideoCreateCommand) {
    const video = new Video({
      ...props,
      categoriesId: new Map(
        props.categoriesId.map((id) => [id.toString(), id]),
      ),
      genresId: new Map(props.genresId.map((id) => [id.toString(), id])),
      castMembersId: new Map(
        props.castMembersId.map((id) => [id.toString(), id]),
      ),
      isPublished: false,
    });

    video.validate(['title']);

    video.applyEvent(
      new VideoCreatedEvent({
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        releasedYear: video.releasedYear,
        duration: video.duration,
        rating: video.rating,
        isOpened: video.isOpened,
        isPublished: video.isPublished,
        banner: video.banner,
        thumbnail: video.thumbnail,
        thumbnailHalf: video.thumbnailHalf,
        trailer: video.trailer!,
        video: video.video!,
        categoriesId: Array.from(video.categoriesId.values()),
        genresId: Array.from(video.genresId.values()),
        castMembersId: Array.from(video.castMembersId.values()),
        createdAt: video.createdAt,
      }),
    );

    return video;
  }

  changeTitle(title: string) {
    this.title = title;

    this.validate(['title']);
  }

  changeDescription(description: string) {
    this.description = description;
  }

  changeReleasedYear(releasedYear: number) {
    this.releasedYear = releasedYear;
  }

  changeDuration(duration: number) {
    this.duration = duration;
  }

  changeRating(rating: Rating) {
    this.rating = rating;
  }

  markAsOpened() {
    this.isOpened = true;
  }

  markAsClosed() {
    this.isOpened = false;
  }

  replaceBanner(banner: Banner): void {
    this.banner = banner;
  }

  replaceThumbnail(thumbnail: Thumbnail): void {
    this.thumbnail = thumbnail;
  }

  replaceThumbnailHalf(thumbnailHalf: ThumbnailHalf): void {
    this.thumbnailHalf = thumbnailHalf;
  }

  replaceTrailer(trailer: Trailer): void {
    this.trailer = trailer;

    this.applyEvent(
      new AudioVideoMediaReplacedEvent({
        aggregateId: this.videoId,
        media: trailer,
        mediaType: 'trailer',
      }),
    );
  }

  replaceVideo(video: VideoMedia): void {
    this.video = video;

    this.applyEvent(
      new AudioVideoMediaReplacedEvent({
        aggregateId: this.videoId,
        media: video,
        mediaType: 'video',
      }),
    );
  }

  addCategoryId(categoryId: CategoryId) {
    this.categoriesId.set(categoryId.id, categoryId);
  }

  removeCategoryId(categoryId: CategoryId) {
    this.categoriesId.delete(categoryId.id);
  }

  syncCategoriesId(categoriesId: CategoryId[]) {
    if (!categoriesId.length) {
      throw new Error('Categories id is empty');
    }

    this.categoriesId = new Map(categoriesId.map((id) => [id.id, id]));
  }

  addGenreId(genreId: GenreId) {
    this.genresId.set(genreId.id, genreId);
  }

  removeGenreId(genreId: GenreId) {
    this.genresId.delete(genreId.id);
  }

  syncGenresId(genresId: GenreId[]) {
    if (!genresId.length) {
      throw new Error('Genres id is empty');
    }

    this.genresId = new Map(genresId.map((id) => [id.id, id]));
  }

  addCastMemberId(castMemberId: CastMemberId) {
    this.castMembersId.set(castMemberId.id, castMemberId);
  }

  removeCastMemberId(castMemberId: CastMemberId) {
    this.castMembersId.delete(castMemberId.id);
  }

  syncCastMembersId(castMembersId: CastMemberId[]) {
    if (!castMembersId.length) {
      throw new Error('Cast members id is empty');
    }

    this.castMembersId = new Map(castMembersId.map((id) => [id.id, id]));
  }

  onVideoCreated(event: VideoCreatedEvent) {
    if (this.isPublished) {
      return;
    }

    this.tryMarkAsPublished();
  }

  onAudioVideoMediaReplaced(event: AudioVideoMediaReplacedEvent) {
    if (this.isPublished) {
      return;
    }

    this.tryMarkAsPublished();
  }

  private tryMarkAsPublished() {
    if (
      this.trailer &&
      this.video &&
      this.trailer.status === AudioVideoMediaStatus.COMPLETED &&
      this.video.status === AudioVideoMediaStatus.COMPLETED
    ) {
      this.isPublished = true;
    }
  }

  validate(fields?: string[]) {
    const validator = VideoValidatorFactory.create();

    return validator.validate(this.notification, this, fields);
  }

  get entityId(): ValueObject {
    return this.videoId;
  }

  static fake() {
    return VideoFakeBuilder;
  }

  toJSON() {
    return {
      videoId: this.videoId.id,
      title: this.title,
      description: this.description,
      releasedYear: this.releasedYear,
      duration: this.duration,
      rating: this.rating.value,
      isOpened: this.isOpened,
      isPublished: this.isPublished,
      banner: this.banner ? this.banner.toJSON() : null,
      thumbnail: this.thumbnail ? this.thumbnail.toJSON() : null,
      thumbnailHalf: this.thumbnailHalf ? this.thumbnailHalf.toJSON() : null,
      trailer: this.trailer ? this.trailer.toJSON() : null,
      video: this.video ? this.video.toJSON() : null,
      categoriesId: Array.from(this.categoriesId.values()).map((id) => id.id),
      genresId: Array.from(this.genresId.values()).map((id) => id.id),
      castMembersId: Array.from(this.castMembersId.values()).map((id) => id.id),
      createdAt: this.createdAt,
    };
  }
}

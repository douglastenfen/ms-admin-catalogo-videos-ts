import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { Chance } from 'chance';
import { Banner } from './banner.vo';
import { Rating } from './rating.vo';
import { ThumbnailHalf } from './thumbnail-half.vo';
import { Thumbnail } from './thumbnail.vo';
import { Trailer } from './trailer.vo';
import { VideoMedia } from './video-media.vo';
import { Video, VideoId } from './video.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export class VideoFakeBuilder<TBuild = any> {
  private _videoId: PropOrFactory<VideoId> | undefined = undefined;
  private _title: PropOrFactory<string> = (_index) => this.chance.word();
  private _description: PropOrFactory<string> = (_index) =>
    this.chance.paragraph();
  private _releasedYear: PropOrFactory<number> = (_index) =>
    +this.chance.year();
  private _duration: PropOrFactory<number> = (_index) =>
    this.chance.integer({ min: 1, max: 100 });
  private _rating: PropOrFactory<Rating> = (_index) => Rating.createRL();
  private _isOpened: PropOrFactory<boolean> = (_index) => true;
  private _banner: PropOrFactory<Banner | null> | undefined = new Banner({
    name: 'test-name-banner.png',
    location: 'test path banner',
  });
  private _thumbnail: PropOrFactory<Thumbnail | null> | undefined =
    new Thumbnail({
      name: 'test-name-thumbnail.png',
      location: 'test path thumbnail',
    });
  private _thumbnailHalf: PropOrFactory<ThumbnailHalf | null> | undefined =
    new ThumbnailHalf({
      name: 'test-name-thumbnail-half.png',
      location: 'test path thumbnail-half',
    });
  private _trailer: PropOrFactory<Trailer | null> | undefined = Trailer.create({
    name: 'test-name-trailer.mp4',
    rawLocation: 'test path trailer',
  });
  private _video: PropOrFactory<VideoMedia | null> | undefined =
    VideoMedia.create({
      name: 'test-name-video.mp4',
      rawLocation: 'test path video',
    });
  private _categoriesId: PropOrFactory<CategoryId>[] = [];
  private _genresId: PropOrFactory<GenreId>[] = [];
  private _castMembersId: PropOrFactory<CastMemberId>[] = [];
  private _createdAt: PropOrFactory<Date> | undefined = undefined;

  private countObjs;

  static aVideoWithoutMedias() {
    return new VideoFakeBuilder<Video>()
      .withoutBanner()
      .withoutThumbnail()
      .withoutThumbnailHalf()
      .withoutTrailer()
      .withoutVideo();
  }

  static aVideoWithAllMedias() {
    return new VideoFakeBuilder<Video>();
  }

  static theVideosWithoutMedias(countObjs: number) {
    return new VideoFakeBuilder<Video[]>(countObjs)
      .withoutBanner()
      .withoutThumbnail()
      .withoutThumbnailHalf()
      .withoutTrailer()
      .withoutVideo();
  }

  static theVideosWithAllMedias(countObjs: number) {
    return new VideoFakeBuilder<Video[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withVideoId(valueOrFactory: PropOrFactory<VideoId>) {
    this._videoId = valueOrFactory;
    return this;
  }

  withTitle(valueOrFactory: PropOrFactory<string>) {
    this._title = valueOrFactory;
    return this;
  }

  withDescription(valueOrFactory: PropOrFactory<string>) {
    this._description = valueOrFactory;
    return this;
  }

  withReleasedYear(valueOrFactory: PropOrFactory<number>) {
    this._releasedYear = valueOrFactory;
    return this;
  }

  withDuration(valueOrFactory: PropOrFactory<number>) {
    this._duration = valueOrFactory;
    return this;
  }

  withRating(valueOrFactory: PropOrFactory<Rating>) {
    this._rating = valueOrFactory;
    return this;
  }

  withMarkAsOpened() {
    this._isOpened = true;
    return this;
  }

  withMarkAsClosed() {
    this._isOpened = false;
    return this;
  }

  withBanner(valueOrFactory: PropOrFactory<Banner | null>) {
    this._banner = valueOrFactory;
    return this;
  }

  withoutBanner() {
    this._banner = null;
    return this;
  }

  withThumbnail(valueOrFactory: PropOrFactory<Thumbnail | null>) {
    this._thumbnail = valueOrFactory;
    return this;
  }

  withoutThumbnail() {
    this._thumbnail = null;
    return this;
  }

  withThumbnailHalf(valueOrFactory: PropOrFactory<ThumbnailHalf | null>) {
    this._thumbnailHalf = valueOrFactory;
    return this;
  }

  withoutThumbnailHalf() {
    this._thumbnailHalf = null;
    return this;
  }

  withTrailer(valueOrFactory: PropOrFactory<Trailer | null>) {
    this._trailer = valueOrFactory;
    return this;
  }

  withTrailerComplete() {
    this._trailer = Trailer.create({
      name: 'test-name-trailer.mp4',
      rawLocation: 'test path trailer',
    }).complete('test encondedLocation trailer');
    return this;
  }

  withoutTrailer() {
    this._trailer = null;
    return this;
  }

  withVideo(valueOrFactory: PropOrFactory<VideoMedia | null>) {
    this._video = valueOrFactory;
    return this;
  }

  withVideoComplete() {
    this._video = VideoMedia.create({
      name: 'test-name-video.mp4',
      rawLocation: 'test path video',
    }).complete('test encondedLocation video');
    return this;
  }

  withoutVideo() {
    this._video = null;
    return this;
  }

  addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
    this._categoriesId.push(valueOrFactory);
    return this;
  }

  addGenreId(valueOrFactory: PropOrFactory<GenreId>) {
    this._genresId.push(valueOrFactory);
    return this;
  }

  addCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
    this._castMembersId.push(valueOrFactory);
    return this;
  }

  withInvalidTitleTooLong(value?: string) {
    this._title = value ?? this.chance.word({ length: 256 });
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const videos = new Array(this.countObjs).fill(undefined).map((_, index) => {
      const categoryId = new CategoryId();
      const categoriesId = this._categoriesId.length
        ? this.callFactory(this._categoriesId, index)
        : [categoryId];

      const genreId = new GenreId();
      const genresId = this._genresId.length
        ? this.callFactory(this._genresId, index)
        : [genreId];

      const castMemberId = new CastMemberId();
      const castMembersId = this._castMembersId.length
        ? this.callFactory(this._castMembersId, index)
        : [castMemberId];

      const video = Video.create({
        title: this.callFactory(this._title, index),
        description: this.callFactory(this._description, index),
        releasedYear: this.callFactory(this._releasedYear, index),
        duration: this.callFactory(this._duration, index),
        rating: this.callFactory(this._rating, index),
        isOpened: this.callFactory(this._isOpened, index),
        banner: this.callFactory(this._banner, index),
        thumbnail: this.callFactory(this._thumbnail, index),
        thumbnailHalf: this.callFactory(this._thumbnailHalf, index),
        trailer: this.callFactory(this._trailer, index),
        video: this.callFactory(this._video, index),
        categoriesId,
        genresId,
        castMembersId,
        ...(this._createdAt && {
          createdAt: this.callFactory(this._createdAt, index),
        }),
      });

      video['videoId'] = !this._videoId
        ? video['videoId']
        : this.callFactory(this._videoId, index);

      video.validate();

      return video;
    });

    return this.countObjs === 1 ? (videos[0] as TBuild) : (videos as TBuild);
  }

  get videoId() {
    return this.getValue('videoId');
  }

  get title() {
    return this.getValue('title');
  }

  get description() {
    return this.getValue('description');
  }

  get releasedYear() {
    return this.getValue('releasedYear');
  }

  get duration() {
    return this.getValue('duration');
  }

  get rating() {
    return this.getValue('rating');
  }

  get isOpened() {
    return this.getValue('isOpened');
  }

  get banner() {
    const banner = this.getValue('banner');

    return (
      banner ??
      new Banner({
        name: 'test-name-banner.png',
        location: 'test path banner',
      })
    );
  }

  get thumbnail() {
    const thumbnail = this.getValue('thumbnail');

    return (
      thumbnail ??
      new Thumbnail({
        name: 'test-name-thumbnail.png',
        location: 'test path thumbnail',
      })
    );
  }

  get thumbnailHalf() {
    const thumbnailHalf = this.getValue('thumbnailHalf');

    return (
      thumbnailHalf ??
      new ThumbnailHalf({
        name: 'test-name-thumbnail-half.png',
        location: 'test path thumbnail-half',
      })
    );
  }

  get trailer() {
    const trailer = this.getValue('trailer');

    return (
      trailer ??
      Trailer.create({
        name: 'test-name-trailer.mp4',
        rawLocation: 'test path trailer',
      })
    );
  }

  get video() {
    const video = this.getValue('video');

    return (
      video ??
      VideoMedia.create({
        name: 'test-name-video.mp4',
        rawLocation: 'test path video',
      })
    );
  }

  get categoriesId(): CategoryId[] {
    const categoriesId = this.getValue('categoriesId');

    if (!categoriesId.length) {
      return [new CategoryId()];
    }

    return categoriesId;
  }

  get genresId() {
    const genresId = this.getValue('genresId');

    if (!genresId.length) {
      return [new GenreId()];
    }

    return genresId;
  }

  get castMembersId() {
    const castMembersId = this.getValue('castMembersId');

    if (!castMembersId.length) {
      return [new CastMemberId()];
    }

    return castMembersId;
  }

  get createdAt() {
    return this.getValue('createdAt');
  }

  private getValue(prop: any) {
    const optional = ['videoId', 'createdAt'];

    const privateProp = `_${prop}` as keyof this;

    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`,
      );
    }

    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    if (typeof factoryOrValue === 'function') {
      return factoryOrValue(index);
    }

    if (factoryOrValue instanceof Array) {
      return factoryOrValue.map((value) => this.callFactory(value, index));
    }

    return factoryOrValue;
  }
}

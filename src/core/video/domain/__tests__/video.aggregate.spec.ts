import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { Banner } from '../banner.vo';
import { Rating } from '../rating.vo';
import { ThumbnailHalf } from '../thumbnail-half.vo';
import { Thumbnail } from '../thumbnail.vo';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { Video, VideoId } from '../video.aggregate';

describe('Video Unit Tests', () => {
  beforeEach(() => {
    Video.prototype.validate = jest
      .fn()
      .mockImplementation(Video.prototype.validate);
  });
  test('constructor of video', () => {
    const categoryId = new CategoryId();
    const categoriesId = new Map<string, CategoryId>([
      [categoryId.id, categoryId],
    ]);
    const genreId = new GenreId();
    const genresId = new Map<string, GenreId>([[genreId.id, genreId]]);
    const castMemberId = new CastMemberId();
    const castMembersId = new Map<string, CastMemberId>([
      [castMemberId.id, castMemberId],
    ]);
    const rating = Rating.createRL();
    let video = new Video({
      title: 'test title',
      description: 'test description',
      releasedYear: 2020,
      duration: 90,
      rating,
      isOpened: true,
      isPublished: true,
      categoriesId: categoriesId,
      genresId: genresId,
      castMembersId: castMembersId,
    });
    expect(video).toBeInstanceOf(Video);
    expect(video.videoId).toBeInstanceOf(VideoId);
    expect(video.title).toBe('test title');
    expect(video.description).toBe('test description');
    expect(video.releasedYear).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toBeInstanceOf(Rating);
    expect(video.isOpened).toBe(true);
    expect(video.isPublished).toBe(true);
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnailHalf).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categoriesId).toEqual(categoriesId);
    expect(video.genresId).toEqual(genresId);
    expect(video.castMembersId).toEqual(castMembersId);
    expect(video.createdAt).toBeInstanceOf(Date);

    const banner = new Banner({
      name: 'test name banner',
      location: 'test location banner',
    });

    const thumbnail = new Thumbnail({
      name: 'test name thumbnail',
      location: 'test location thumbnail',
    });

    const thumbnailHalf = new ThumbnailHalf({
      name: 'test name thumbnail half',
      location: 'test location thumbnail half',
    });

    const trailer = Trailer.create({
      name: 'test name trailer',
      rawLocation: 'test raw location trailer',
    });

    const videoMedia = VideoMedia.create({
      name: 'test name video',
      rawLocation: 'test raw location video',
    });

    video = new Video({
      title: 'test title',
      description: 'test description',
      releasedYear: 2020,
      duration: 90,
      rating,
      isOpened: true,
      isPublished: true,
      banner,
      thumbnail,
      thumbnailHalf: thumbnailHalf,
      trailer,
      video: videoMedia,
      categoriesId: categoriesId,
      genresId: genresId,
      castMembersId: castMembersId,
    });

    expect(video).toBeInstanceOf(Video);
    expect(video.videoId).toBeInstanceOf(VideoId);
    expect(video.title).toBe('test title');
    expect(video.description).toBe('test description');
    expect(video.releasedYear).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toBeInstanceOf(Rating);
    expect(video.isOpened).toBe(true);
    expect(video.isPublished).toBe(true);
    expect(video.banner).toEqual(banner);
    expect(video.thumbnail).toEqual(thumbnail);
    expect(video.thumbnailHalf).toEqual(thumbnailHalf);
    expect(video.trailer).toEqual(trailer);
    expect(video.video).toEqual(videoMedia);
    expect(video.categoriesId).toEqual(categoriesId);
    expect(video.genresId).toEqual(genresId);
    expect(video.castMembersId).toEqual(castMembersId);
    expect(video.createdAt).toBeInstanceOf(Date);
  });

  describe('videoId field', () => {
    const arrange = [
      {},
      { id: null },
      { id: undefined },
      { id: new VideoId() },
    ];

    test.each(arrange)('when props is %j', (item) => {
      const genre = new Video(item as any);
      expect(genre.videoId).toBeInstanceOf(VideoId);
    });
  });

  describe('create command', () => {
    test('should create a video and no publish video media', () => {
      const categoriesId = [new CategoryId()];
      const genresId = [new GenreId()];
      const castMembersId = [new CastMemberId()];

      const spyOnVideoCreated = jest.spyOn(Video.prototype, 'onVideoCreated');
      const tryMarkAsPublished = jest.spyOn(
        Video.prototype as any,
        'tryMarkAsPublished',
      );
      const video = Video.create({
        title: 'test title',
        description: 'test description',
        releasedYear: 2020,
        duration: 90,
        rating: Rating.createRL(),
        isOpened: true,
        categoriesId,
        genresId,
        castMembersId,
      });
      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(video.title).toBe('test title');
      expect(video.description).toBe('test description');
      expect(video.releasedYear).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toBeInstanceOf(Rating);
      expect(video.isOpened).toBe(true);
      expect(video.isPublished).toBe(false);
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnailHalf).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categoriesId).toEqual(
        new Map(categoriesId.map((id) => [id.id, id])),
      );
      expect(video.genresId).toEqual(
        new Map(genresId.map((id) => [id.id, id])),
      );
      expect(video.castMembersId).toEqual(
        new Map(castMembersId.map((id) => [id.id, id])),
      );
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video.isPublished).toBeFalsy();
      expect(spyOnVideoCreated).toHaveBeenCalledTimes(1);
      expect(tryMarkAsPublished).toHaveBeenCalledTimes(1);
    });

    test('should create a video and published video', () => {
      const categoriesId = [new CategoryId()];
      const genresId = [new GenreId()];
      const castMembersId = [new CastMemberId()];

      const spyOnVideCreated = jest.spyOn(Video.prototype, 'onVideoCreated');
      const tryMarkAsPublished = jest.spyOn(
        Video.prototype as any,
        'tryMarkAsPublished',
      );

      const trailer = Trailer.create({
        name: 'test name trailer',
        rawLocation: 'test raw location trailer',
      }).complete('test encoded_location trailer');
      const videoMedia = VideoMedia.create({
        name: 'test name video',
        rawLocation: 'test raw location video',
      }).complete('test encoded_location video');

      const video = Video.create({
        title: 'test title',
        description: 'test description',
        releasedYear: 2020,
        duration: 90,
        rating: Rating.createRL(),
        isOpened: true,
        trailer,
        video: videoMedia,
        categoriesId,
        genresId,
        castMembersId,
      });
      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(video.title).toBe('test title');
      expect(video.description).toBe('test description');
      expect(video.releasedYear).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toBeInstanceOf(Rating);
      expect(video.isOpened).toBe(true);
      expect(video.isPublished).toBe(true);
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnailHalf).toBeNull();
      expect(video.trailer).toEqual(trailer);
      expect(video.video).toEqual(videoMedia);
      expect(video.categoriesId).toEqual(
        new Map(categoriesId.map((id) => [id.id, id])),
      );
      expect(video.genresId).toEqual(
        new Map(genresId.map((id) => [id.id, id])),
      );
      expect(video.castMembersId).toEqual(
        new Map(castMembersId.map((id) => [id.id, id])),
      );
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video.isPublished).toBeTruthy();
      expect(spyOnVideCreated).toHaveBeenCalledTimes(1);
      expect(tryMarkAsPublished).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeTitle method', () => {
    test('should change title', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeTitle('test title');
      expect(video.title).toBe('test title');
      expect(Video.prototype.validate).toHaveBeenCalledTimes(3);
    });
  });

  describe('changeDescription method', () => {
    test('should change description', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeDescription('test description');
      expect(video.description).toBe('test description');
    });
  });

  describe('changeYearLaunched method', () => {
    test('should change year launched', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeReleasedYear(2020);
      expect(video.releasedYear).toBe(2020);
    });
  });

  describe('changeDuration method', () => {
    test('should change duration', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeDuration(90);
      expect(video.duration).toBe(90);
    });
  });

  describe('changeRating method', () => {
    test('should change rating', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const rating = Rating.createRL();
      video.changeRating(rating);
      expect(video.rating).toBe(rating);
    });
  });

  describe('markAsOpened method', () => {
    test('should mark as opened', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.markAsOpened();
      expect(video.isOpened).toBeTruthy();
    });
  });

  describe('markAsNotOpened method', () => {
    test('should mark as not opened', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.markAsClosed();
      expect(video.isOpened).toBeFalsy();
    });
  });

  describe('replaceBanner method', () => {
    test('should replace banner', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const banner = new Banner({
        name: 'test name banner',
        location: 'test location banner',
      });
      video.replaceBanner(banner);
      expect(video.banner).toEqual(banner);
    });
  });

  describe('replaceThumbnail method', () => {
    test('should replace thumbnail', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const thumbnail = new Thumbnail({
        name: 'test name thumbnail',
        location: 'test location thumbnail',
      });
      video.replaceThumbnail(thumbnail);
      expect(video.thumbnail).toEqual(thumbnail);
    });
  });

  describe('replaceThumbnailHalf method', () => {
    test('should replace thumbnail half', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const thumbnailHalf = new ThumbnailHalf({
        name: 'test name thumbnail half',
        location: 'test location thumbnail half',
      });
      video.replaceThumbnailHalf(thumbnailHalf);
      expect(video.thumbnailHalf).toEqual(thumbnailHalf);
    });
  });

  describe('replaceTrailer method', () => {
    test('should replace trailer', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const trailer = Trailer.create({
        name: 'test name trailer',
        rawLocation: 'test raw location trailer',
      });
      video.replaceTrailer(trailer);
      expect(video.trailer).toEqual(trailer);
    });
  });

  describe('replaceVideo method', () => {
    test('should replace video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const videoMedia = VideoMedia.create({
        name: 'test name video',
        rawLocation: 'test raw location video',
      });
      video.replaceVideo(videoMedia);
      expect(video.video).toEqual(videoMedia);
    });
  });

  test('should add category id', () => {
    const categoryId = new CategoryId();
    const video = Video.fake().aVideoWithoutMedias().build();
    video.addCategoryId(categoryId);
    expect(video.categoriesId.size).toBe(2);
    expect(video.categoriesId.get(categoryId.id)).toBe(categoryId);
  });

  test('tryMarkAsPublished method', () => {
    let video = Video.fake().aVideoWithoutMedias().build();
    video['tryMarkAsPublished']();
    expect(video.isPublished).toBeFalsy();

    video = Video.fake().aVideoWithoutMedias().build();
    const trailer = Trailer.create({
      name: 'test name trailer',
      rawLocation: 'test raw location trailer',
    }).complete('test encoded_location trailer');
    const videoMedia = VideoMedia.create({
      name: 'test name video',
      rawLocation: 'test raw location video',
    }).complete('test encoded_location video');

    video.replaceTrailer(trailer);
    video.replaceVideo(videoMedia);
    video['tryMarkAsPublished']();
    expect(video.isPublished).toBeTruthy();
  });
});

describe('Video Validator', () => {
  describe('create command', () => {
    test('should an invalid video with title property', () => {
      const video = Video.create({
        title: 't'.repeat(256),
        categoriesId: [new CategoryId()],
        genresId: [new GenreId()],
        castMembersId: [new CastMemberId()],
      } as any);
      expect(video.notification.hasErrors()).toBe(true);
      expect(video.notification).notificationContainsErrorMessages([
        {
          title: ['title must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
  describe('changeTitle method', () => {
    it('should a invalid video using title property', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeTitle('t'.repeat(256));
      expect(video.notification.hasErrors()).toBe(true);
      expect(video.notification).notificationContainsErrorMessages([
        {
          title: ['title must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});

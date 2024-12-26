import { Chance } from 'chance';
import { VideoFakeBuilder } from '../video-fake.builder';
import { VideoId } from '../video.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { Banner } from '../banner.vo';
import { Rating } from '../rating.vo';
import { ThumbnailHalf } from '../thumbnail-half.vo';
import { Thumbnail } from '../thumbnail.vo';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';

describe('VideoFakeBuilder Unit Tests', () => {
  describe('videoId prop', () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();

    it('should throw error when any with methods has called', () => {
      expect(() => faker.videoId).toThrow(
        new Error(`Property videoId not have a factory, use 'with' methods`),
      );
    });

    it('should be undefined', () => {
      expect(faker['_videoId']).toBeUndefined();
    });

    test('withVideoId', () => {
      const videoId = new VideoId();

      const $this = faker.withVideoId(videoId);

      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect($this['_videoId']).toBe(videoId);

      faker.withVideoId(() => videoId);

      //@ts-expect-error _videoId is a callable
      expect(faker['_videoId']()).toBe(videoId);

      expect(faker.videoId).toBe(videoId);
    });

    it('should pass index to videoId factory', () => {
      let mockFactory = jest.fn(() => new VideoId());

      faker.withVideoId(mockFactory);
      faker.build();

      expect(mockFactory).toHaveBeenCalledTimes(1);

      const genreId = new VideoId();

      mockFactory = jest.fn(() => genreId);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);

      fakerMany.withVideoId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);

      expect(fakerMany.build()[0].videoId).toBe(genreId);
      expect(fakerMany.build()[1].videoId).toBe(genreId);
    });
  });

  describe('title prop', () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();

    it('should be a function', () => {
      expect(faker['_title']).toBeInstanceOf(Function);
    });

    it('should call the word method', () => {
      const chance = Chance();
      const wordSpy = jest.spyOn(chance, 'word');

      faker['chance'] = chance;
      faker.build();

      expect(wordSpy).toHaveBeenCalled();
    });

    test('withTitle', () => {
      const $this = faker.withTitle('Harry Potter');

      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect($this['_title']).toBe('Harry Potter');

      faker.withTitle(() => 'Harry Potter');

      //@ts-expect-error _title is a callable
      expect(faker['_title']()).toBe('Harry Potter');
      expect(faker.title).toBe('Harry Potter');
    });

    it('should pass index to title factory', () => {
      faker.withTitle((index) => `Harry Potter ${index}`);

      const video = faker.build();

      expect(video.title).toBe('Harry Potter 0');

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);

      fakerMany.withTitle((index) => `Harry Potter ${index}`);
      const categories = fakerMany.build();

      expect(categories[0].title).toBe('Harry Potter 0');
      expect(categories[1].title).toBe('Harry Potter 1');
    });

    test('invalid too long case', () => {
      const $this = faker.withInvalidTitleTooLong();

      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker['_title'].length).toBe(256);

      const tooLong = 'a'.repeat(256);

      faker.withInvalidTitleTooLong(tooLong);

      expect(faker['_title'].length).toBe(256);
      expect(faker['_title']).toBe(tooLong);
    });
  });

  describe('categoriesId prop', () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    it('should be empty', () => {
      expect(faker['_categoriesId']).toBeInstanceOf(Array);
    });

    test('withCategoryId', () => {
      const categoryId1 = new CategoryId();

      const $this = faker.addCategoryId(categoryId1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker['_categoriesId']).toStrictEqual([categoryId1]);

      const categoryId2 = new CategoryId();

      faker.addCategoryId(() => categoryId2);

      expect([
        faker['_categoriesId'][0],
        // @ts-expect-error _categoriesId is a callable
        faker['_categoriesId'][1](),
      ]).toStrictEqual([categoryId1, categoryId2]);
    });

    it('should pass index to categoriesId factory', () => {
      const categoriesId = [new CategoryId(), new CategoryId()];
      faker.addCategoryId((index) => categoriesId[index]);
      const genre = faker.build();

      expect(genre.categoriesId.get(categoriesId[0].id)).toBe(categoriesId[0]);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.addCategoryId((index) => categoriesId[index]);
      const genres = fakerMany.build();

      expect(genres[0].categoriesId.get(categoriesId[0].id)).toBe(
        categoriesId[0],
      );

      expect(genres[1].categoriesId.get(categoriesId[1].id)).toBe(
        categoriesId[1],
      );
    });
  });

  describe('createdAt prop', () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();

    it('should throw error when any with methods has called', () => {
      const fakerVideo = VideoFakeBuilder.aVideoWithoutMedias();

      expect(() => fakerVideo.createdAt).toThrow(
        new Error("Property createdAt not have a factory, use 'with' methods"),
      );
    });

    test('should be undefined', () => {
      expect(faker['_createdAt']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const date = new Date();

      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(VideoFakeBuilder);

      expect(faker['_createdAt']).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error _createdAt is a callable
      expect(faker['_createdAt']()).toBe(date);
      expect(faker.createdAt).toBe(date);
    });

    test('should pass index to createdAt factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const genre = faker.build();
      expect(genre.createdAt.getTime()).toBe(date.getTime() + 2);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const categories = fakerMany.build();

      expect(categories[0].createdAt.getTime()).toBe(date.getTime() + 2);
      expect(categories[1].createdAt.getTime()).toBe(date.getTime() + 3);
    });
  });

  it('should create a video without medias', () => {
    let video = VideoFakeBuilder.aVideoWithoutMedias().build();

    expect(video.videoId).toBeInstanceOf(VideoId);
    expect(typeof video.title === 'string').toBeTruthy();
    expect(typeof video.description === 'string').toBeTruthy();
    expect(typeof video.releasedYear === 'number').toBeTruthy();
    expect(typeof video.duration === 'number').toBeTruthy();
    expect(video.rating).toEqual(Rating.createRL());
    expect(video.isOpened).toBeTruthy();
    expect(video.isPublished).toBeFalsy();
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnailHalf).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categoriesId).toBeInstanceOf(Map);
    expect(video.categoriesId.size).toBe(1);
    expect(video.categoriesId.values().next().value).toBeInstanceOf(CategoryId);
    expect(video.genresId).toBeInstanceOf(Map);
    expect(video.genresId.size).toBe(1);
    expect(video.genresId.values().next().value).toBeInstanceOf(GenreId);
    expect(video.castMembersId).toBeInstanceOf(Map);
    expect(video.castMembersId.size).toBe(1);
    expect(video.castMembersId.values().next().value).toBeInstanceOf(
      CastMemberId,
    );
    expect(video.createdAt).toBeInstanceOf(Date);

    const createdAt = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    video = VideoFakeBuilder.aVideoWithoutMedias()
      .withVideoId(videoId)
      .withTitle('name test')
      .withDescription('description test')
      .withReleasedYear(2020)
      .withDuration(90)
      .withRating(Rating.createR10())
      .withMarkAsClosed()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withCreatedAt(createdAt)
      .build();
    expect(video.videoId.id).toBe(videoId.id);
    expect(video.title).toBe('name test');
    expect(video.description).toBe('description test');
    expect(video.releasedYear).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toEqual(Rating.createR10());
    expect(video.isOpened).toBeFalsy();
    expect(video.isPublished).toBeFalsy();
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnailHalf).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categoriesId).toBeInstanceOf(Map);
    expect(video.categoriesId.get(categoryId1.id)).toBe(categoryId1);
    expect(video.categoriesId.get(categoryId2.id)).toBe(categoryId2);
    expect(video.genresId).toBeInstanceOf(Map);
    expect(video.genresId.get(genreId1.id)).toBe(genreId1);
    expect(video.genresId.get(genreId2.id)).toBe(genreId2);
    expect(video.castMembersId).toBeInstanceOf(Map);
    expect(video.castMembersId.get(castMemberId1.id)).toBe(castMemberId1);
    expect(video.castMembersId.get(castMemberId2.id)).toBe(castMemberId2);
    expect(video.createdAt).toEqual(createdAt);
  });

  it('should create a video with medias', () => {
    let video = VideoFakeBuilder.aVideoWithAllMedias().build();

    expect(video.videoId).toBeInstanceOf(VideoId);
    expect(typeof video.title === 'string').toBeTruthy();
    expect(typeof video.description === 'string').toBeTruthy();
    expect(typeof video.releasedYear === 'number').toBeTruthy();
    expect(typeof video.duration === 'number').toBeTruthy();
    expect(video.rating).toEqual(Rating.createRL());
    expect(video.isOpened).toBeTruthy();
    expect(video.isPublished).toBeFalsy();
    expect(video.banner).toBeInstanceOf(Banner);
    expect(video.thumbnail).toBeInstanceOf(Thumbnail);
    expect(video.thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
    expect(video.trailer).toBeInstanceOf(Trailer);
    expect(video.video).toBeInstanceOf(VideoMedia);
    expect(video.categoriesId).toBeInstanceOf(Map);
    expect(video.categoriesId.size).toBe(1);
    expect(video.categoriesId.values().next().value).toBeInstanceOf(CategoryId);
    expect(video.genresId).toBeInstanceOf(Map);
    expect(video.genresId.size).toBe(1);
    expect(video.genresId.values().next().value).toBeInstanceOf(GenreId);
    expect(video.castMembersId).toBeInstanceOf(Map);
    expect(video.castMembersId.size).toBe(1);
    expect(video.castMembersId.values().next().value).toBeInstanceOf(
      CastMemberId,
    );
    expect(video.createdAt).toBeInstanceOf(Date);

    const createdAt = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const banner = new Banner({
      location: 'location',
      name: 'name',
    });
    const thumbnail = new Thumbnail({
      location: 'location',
      name: 'name',
    });
    const thumbnailHalf = new ThumbnailHalf({
      location: 'location',
      name: 'name',
    });
    const trailer = Trailer.create({
      rawLocation: 'rawLocation',
      name: 'name',
    });
    const videoMedia = VideoMedia.create({
      rawLocation: 'rawLocation',
      name: 'name',
    });
    video = VideoFakeBuilder.aVideoWithAllMedias()
      .withVideoId(videoId)
      .withTitle('name test')
      .withDescription('description test')
      .withReleasedYear(2020)
      .withDuration(90)
      .withRating(Rating.createR10())
      .withMarkAsClosed()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withBanner(banner)
      .withThumbnail(thumbnail)
      .withThumbnailHalf(thumbnailHalf)
      .withTrailer(trailer)
      .withVideo(videoMedia)
      .withCreatedAt(createdAt)
      .build();
    expect(video.videoId.id).toBe(videoId.id);
    expect(video.title).toBe('name test');
    expect(video.description).toBe('description test');
    expect(video.releasedYear).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toEqual(Rating.createR10());
    expect(video.isOpened).toBeFalsy();
    expect(video.isPublished).toBeFalsy();
    expect(video.banner).toBe(banner);
    expect(video.thumbnail).toBe(thumbnail);
    expect(video.thumbnailHalf).toBe(thumbnailHalf);
    expect(video.trailer).toBe(trailer);
    expect(video.video).toBe(videoMedia);
    expect(video.categoriesId).toBeInstanceOf(Map);
    expect(video.categoriesId.get(categoryId1.id)).toBe(categoryId1);
    expect(video.categoriesId.get(categoryId2.id)).toBe(categoryId2);
    expect(video.genresId).toBeInstanceOf(Map);
    expect(video.genresId.get(genreId1.id)).toBe(genreId1);
    expect(video.genresId.get(genreId2.id)).toBe(genreId2);
    expect(video.castMembersId).toBeInstanceOf(Map);
    expect(video.castMembersId.get(castMemberId1.id)).toBe(castMemberId1);
    expect(video.castMembersId.get(castMemberId2.id)).toBe(castMemberId2);
    expect(video.createdAt).toEqual(createdAt);
  });

  it('should create many videos without medias', () => {
    const faker = VideoFakeBuilder.theVideosWithoutMedias(2);
    let videos = faker.build();
    videos.forEach((video) => {
      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(typeof video.title === 'string').toBeTruthy();
      expect(typeof video.description === 'string').toBeTruthy();
      expect(typeof video.releasedYear === 'number').toBeTruthy();
      expect(typeof video.duration === 'number').toBeTruthy();
      expect(video.rating).toEqual(Rating.createRL());
      expect(video.isOpened).toBeTruthy();
      expect(video.isPublished).toBeFalsy();
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnailHalf).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categoriesId).toBeInstanceOf(Map);
      expect(video.categoriesId.size).toBe(1);
      expect(video.categoriesId.values().next().value).toBeInstanceOf(
        CategoryId,
      );
      expect(video.genresId).toBeInstanceOf(Map);
      expect(video.genresId.size).toBe(1);
      expect(video.genresId.values().next().value).toBeInstanceOf(GenreId);
      expect(video.castMembersId).toBeInstanceOf(Map);
      expect(video.castMembersId.size).toBe(1);
      expect(video.castMembersId.values().next().value).toBeInstanceOf(
        CastMemberId,
      );
      expect(video.createdAt).toBeInstanceOf(Date);
    });

    const createdAt = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    videos = VideoFakeBuilder.theVideosWithoutMedias(2)
      .withVideoId(videoId)
      .withTitle('name test')
      .withDescription('description test')
      .withReleasedYear(2020)
      .withDuration(90)
      .withRating(Rating.createR10())
      .withMarkAsClosed()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withCreatedAt(createdAt)
      .build();
    videos.forEach((video) => {
      expect(video.videoId.id).toBe(videoId.id);
      expect(video.title).toBe('name test');
      expect(video.description).toBe('description test');
      expect(video.releasedYear).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toEqual(Rating.createR10());
      expect(video.isOpened).toBeFalsy();
      expect(video.isPublished).toBeFalsy();
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnailHalf).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categoriesId).toBeInstanceOf(Map);
      expect(video.categoriesId.get(categoryId1.id)).toBe(categoryId1);
      expect(video.categoriesId.get(categoryId2.id)).toBe(categoryId2);
      expect(video.genresId).toBeInstanceOf(Map);
      expect(video.genresId.get(genreId1.id)).toBe(genreId1);
      expect(video.genresId.get(genreId2.id)).toBe(genreId2);
      expect(video.castMembersId).toBeInstanceOf(Map);
      expect(video.castMembersId.get(castMemberId1.id)).toBe(castMemberId1);
      expect(video.castMembersId.get(castMemberId2.id)).toBe(castMemberId2);
      expect(video.createdAt).toEqual(createdAt);
    });
  });

  it('should create many videos with medias', () => {
    const faker = VideoFakeBuilder.theVideosWithAllMedias(2);
    let videos = faker.build();
    videos.forEach((video) => {
      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(typeof video.title === 'string').toBeTruthy();
      expect(typeof video.description === 'string').toBeTruthy();
      expect(typeof video.releasedYear === 'number').toBeTruthy();
      expect(typeof video.duration === 'number').toBeTruthy();
      expect(video.rating).toEqual(Rating.createRL());
      expect(video.isOpened).toBeTruthy();
      expect(video.isPublished).toBeFalsy();
      expect(video.banner).toBeInstanceOf(Banner);
      expect(video.thumbnail).toBeInstanceOf(Thumbnail);
      expect(video.thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
      expect(video.trailer).toBeInstanceOf(Trailer);
      expect(video.video).toBeInstanceOf(VideoMedia);
      expect(video.categoriesId).toBeInstanceOf(Map);
      expect(video.categoriesId.size).toBe(1);
      expect(video.categoriesId.values().next().value).toBeInstanceOf(
        CategoryId,
      );
      expect(video.genresId).toBeInstanceOf(Map);
      expect(video.genresId.size).toBe(1);
      expect(video.genresId.values().next().value).toBeInstanceOf(GenreId);
      expect(video.castMembersId).toBeInstanceOf(Map);
      expect(video.castMembersId.size).toBe(1);
      expect(video.castMembersId.values().next().value).toBeInstanceOf(
        CastMemberId,
      );
      expect(video.createdAt).toBeInstanceOf(Date);
    });

    const createdAt = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const banner = new Banner({
      location: 'location',
      name: 'name',
    });
    const thumbnail = new Thumbnail({
      location: 'location',
      name: 'name',
    });
    const thumbnailHalf = new ThumbnailHalf({
      location: 'location',
      name: 'name',
    });
    const trailer = Trailer.create({
      rawLocation: 'rawLocation',
      name: 'name',
    });
    const videoMedia = VideoMedia.create({
      rawLocation: 'rawLocation',
      name: 'name',
    });
    videos = VideoFakeBuilder.theVideosWithAllMedias(2)
      .withVideoId(videoId)
      .withTitle('name test')
      .withDescription('description test')
      .withReleasedYear(2020)
      .withDuration(90)
      .withRating(Rating.createR10())
      .withMarkAsClosed()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withBanner(banner)
      .withThumbnail(thumbnail)
      .withThumbnailHalf(thumbnailHalf)
      .withTrailer(trailer)
      .withVideo(videoMedia)
      .withCreatedAt(createdAt)
      .build();
    videos.forEach((video) => {
      expect(video.videoId.id).toBe(videoId.id);
      expect(video.title).toBe('name test');
      expect(video.description).toBe('description test');
      expect(video.releasedYear).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toEqual(Rating.createR10());
      expect(video.isOpened).toBeFalsy();
      expect(video.isPublished).toBeFalsy();
      expect(video.banner).toBe(banner);
      expect(video.thumbnail).toBe(thumbnail);
      expect(video.thumbnailHalf).toBe(thumbnailHalf);
      expect(video.trailer).toBe(trailer);
      expect(video.video).toBe(videoMedia);
      expect(video.categoriesId).toBeInstanceOf(Map);
      expect(video.categoriesId.get(categoryId1.id)).toBe(categoryId1);
      expect(video.categoriesId.get(categoryId2.id)).toBe(categoryId2);
      expect(video.genresId).toBeInstanceOf(Map);
      expect(video.genresId.get(genreId1.id)).toBe(genreId1);
      expect(video.genresId.get(genreId2.id)).toBe(genreId2);
      expect(video.castMembersId).toBeInstanceOf(Map);
      expect(video.castMembersId.get(castMemberId1.id)).toBe(castMemberId1);
      expect(video.castMembersId.get(castMemberId2.id)).toBe(castMemberId2);
      expect(video.createdAt).toEqual(createdAt);
    });
  });
});

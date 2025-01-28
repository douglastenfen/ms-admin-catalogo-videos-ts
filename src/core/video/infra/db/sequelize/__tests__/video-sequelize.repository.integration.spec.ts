import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelizeForVideo } from '../testing/helper';
import { VideoSequelizeRepository } from '../video-sequelize.repository';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../video.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { ImageMediaModel } from '../image-media.model';
import { AudioVideoMediaModel } from '../audio-video-media.model';
import { VideoModelMapper } from '../video.model.mapper';
import {
  VideoSearchParams,
  VideoSearchResult,
} from '@core/video/domain/video.repository';

describe('VideoSequelizeRepository Integration Tests', () => {
  const sequelizeHelper = setupSequelizeForVideo({ logging: true });

  let videoRepository: VideoSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let castMemberRepository: CastMemberSequelizeRepository;

  let uow: UnitOfWorkSequelize;

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepository = new VideoSequelizeRepository(VideoModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  it('should insert a new entity without medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.insert(video);

    const newVideo = await videoRepository.findByID(video.videoId);

    expect(newVideo!.toJSON()).toStrictEqual(video.toJSON());
  });

  it('should insert a new entity with medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.insert(video);

    const newVideo = await videoRepository.findByID(video.videoId);

    expect(newVideo!.toJSON()).toStrictEqual(video.toJSON());
  });

  it('should bulk insert new entities without medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const videos = Video.fake()
      .theVideosWithoutMedias(2)
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.bulkInsert(videos);

    const newVideos = await videoRepository.findAll();

    expect(newVideos).toHaveLength(2);

    expect(newVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
    expect(newVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
  });

  it('should bulk insert new entities with medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const videos = Video.fake()
      .theVideosWithAllMedias(2)
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.bulkInsert(videos);

    const newVideos = await videoRepository.findAll();

    expect(newVideos).toHaveLength(2);

    expect(newVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
    expect(newVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
  });

  it('should find a entity by id without medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.insert(video);

    const entityFound = await videoRepository.findByID(video.videoId);

    expect(video.toJSON()).toStrictEqual(entityFound!.toJSON());
  });

  it('should find a entity by id with medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.insert(video);

    const entityFound = await videoRepository.findByID(video.videoId);

    expect(video.toJSON()).toStrictEqual(entityFound!.toJSON());
  });

  it('should return all videos without medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const videos = Video.fake()
      .theVideosWithoutMedias(2)
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.bulkInsert(videos);

    const allVideos = await videoRepository.findAll();

    expect(allVideos).toHaveLength(2);

    expect(allVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
    expect(allVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
  });

  it('should return all videos with medias', async () => {
    const { category, genre, castMember } = await createRelations();

    const videos = Video.fake()
      .theVideosWithAllMedias(2)
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.bulkInsert(videos);

    const allVideos = await videoRepository.findAll();

    expect(allVideos).toHaveLength(2);

    expect(allVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
    expect(allVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
  });

  it('should throw an error on update when an entity is not found', async () => {
    const video = Video.fake().aVideoWithoutMedias().build();

    await expect(videoRepository.update(video)).rejects.toThrow(
      new NotFoundError(video.videoId.id, Video),
    );
  });

  it('should update an entity', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);

    const genres = Genre.fake()
      .theGenres(3)
      .addCategoriesId(categories[0].categoryID)
      .build();
    await genreRepository.bulkInsert(genres);

    const castMembers = CastMember.fake().theCastMembers(3).build();
    await castMemberRepository.bulkInsert(castMembers);

    const fakeVideo = Video.fake().aVideoWithoutMedias();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(categories[0].categoryID)
      .addGenreId(genres[0].genreId)
      .addCastMemberId(castMembers[0].castMemberId)
      .build();

    await videoRepository.insert(video);

    video.changeTitle('Title changed');
    video.syncCategoriesId([categories[1].categoryID]);
    video.syncGenresId([genres[1].genreId]);
    video.syncCastMembersId([castMembers[1].castMemberId]);
    await videoRepository.update(video);

    let videoUpdated = await videoRepository.findByID(video.videoId);

    expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());

    await expect(VideoCategoryModel.count()).resolves.toBe(1);
    await expect(VideoGenreModel.count()).resolves.toBe(1);
    await expect(VideoCastMemberModel.count()).resolves.toBe(1);

    video.replaceBanner(fakeVideo.banner);
    video.replaceThumbnail(fakeVideo.thumbnail);
    video.replaceThumbnailHalf(fakeVideo.thumbnailHalf);
    video.replaceTrailer(fakeVideo.trailer);
    video.replaceVideo(fakeVideo.video);
    await videoRepository.update(video);

    videoUpdated = await videoRepository.findByID(video.videoId);

    expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());

    await expect(VideoCategoryModel.count()).resolves.toBe(1);
    await expect(VideoGenreModel.count()).resolves.toBe(1);
    await expect(VideoCastMemberModel.count()).resolves.toBe(1);
    await expect(ImageMediaModel.count()).resolves.toBe(3);
    await expect(AudioVideoMediaModel.count()).resolves.toBe(2);

    video.replaceBanner(fakeVideo.banner);
    video.replaceThumbnail(fakeVideo.thumbnail);
    video.replaceThumbnailHalf(fakeVideo.thumbnailHalf);
    video.replaceTrailer(fakeVideo.trailer);
    video.replaceVideo(fakeVideo.video);
    await videoRepository.update(video);

    videoUpdated = await videoRepository.findByID(video.videoId);

    expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());

    await expect(VideoCategoryModel.count()).resolves.toBe(1);
    await expect(VideoGenreModel.count()).resolves.toBe(1);
    await expect(VideoCastMemberModel.count()).resolves.toBe(1);
    await expect(ImageMediaModel.count()).resolves.toBe(3);
    await expect(AudioVideoMediaModel.count()).resolves.toBe(2);
  });

  it('should throw an error on delete when an entity is not found', async () => {
    const videoId = new VideoId();

    await expect(videoRepository.delete(videoId)).rejects.toThrow(
      new NotFoundError(videoId.id, Video),
    );

    await expect(
      videoRepository.delete(
        new VideoId('9366b7dc-4b3b-4b7b-8b3d-2b7e6b4b7b7b'),
      ),
    ).rejects.toThrow(
      new NotFoundError('9366b7dc-4b3b-4b7b-8b3d-2b7e6b4b7b7b', Video),
    );
  });

  it('should delete an entity', async () => {
    const { category, genre, castMember } = await createRelations();

    let video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.insert(video);

    await videoRepository.delete(video.videoId);

    let videoFound = await VideoModel.findByPk(video.videoId.id);

    expect(videoFound).toBeNull();

    await expect(VideoCategoryModel.count()).resolves.toBe(0);
    await expect(VideoGenreModel.count()).resolves.toBe(0);
    await expect(VideoCastMemberModel.count()).resolves.toBe(0);

    video = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();
    await videoRepository.insert(video);
    await videoRepository.delete(video.videoId);

    videoFound = await VideoModel.findByPk(video.videoId.id);

    expect(videoFound).toBeNull();

    await expect(VideoCategoryModel.count()).resolves.toBe(0);
    await expect(VideoGenreModel.count()).resolves.toBe(0);
    await expect(VideoCastMemberModel.count()).resolves.toBe(0);
    await expect(ImageMediaModel.count()).resolves.toBe(0);
    await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
  });

  describe('search methods tests', () => {
    it('should order by createdAt DESC when search params are null', async () => {
      const { category, genre, castMember } = await createRelations();

      const videos = Video.fake()
        .theVideosWithAllMedias(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .addCategoryId(category.categoryID)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();

      await videoRepository.bulkInsert(videos);

      const spyToEntity = jest.spyOn(VideoModelMapper, 'toEntity');

      const searchOutput = await videoRepository.search(
        VideoSearchParams.create(),
      );

      expect(searchOutput).toBeInstanceOf(VideoSearchResult);

      expect(spyToEntity).toHaveBeenCalledTimes(15);

      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });

      [...videos.slice(1, 16)].reverse().forEach((video, index) => {
        expect(searchOutput.items[index]).toBeInstanceOf(Video);

        const expected = searchOutput.items[index].toJSON();

        expect(video.toJSON()).toStrictEqual({
          ...expected,
          categoriesId: [category.categoryID.id],
          genresId: [genre.genreId.id],
          castMembersId: [castMember.castMemberId.id],
        });
      });
    });

    it('should apply paginate and filter by title', async () => {
      const { category, genre, castMember } = await createRelations();

      const videos = [
        Video.fake()
          .aVideoWithAllMedias()
          .withTitle('test')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
        Video.fake()
          .aVideoWithAllMedias()
          .withTitle('a')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
        Video.fake()
          .aVideoWithAllMedias()
          .withTitle('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
        Video.fake()
          .aVideoWithAllMedias()
          .withTitle('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
      ];

      await videoRepository.bulkInsert(videos);

      let searchOutput = await videoRepository.search(
        VideoSearchParams.create({
          page: 1,
          perPage: 2,
          filter: { title: 'TEST' },
        }),
      );

      let expected = new VideoSearchResult({
        items: [videos[0], videos[2]],
        total: 3,
        currentPage: 1,
        perPage: 2,
      }).toJSON(true);

      expect(searchOutput.toJSON(true)).toMatchObject({
        ...expected,
        items: [
          {
            ...expected.items[0],
            categoriesId: [category.categoryID.id],
            genresId: [genre.genreId.id],
            castMembersId: [castMember.castMemberId.id],
          },
          {
            ...expected.items[1],
            categoriesId: [category.categoryID.id],
            genresId: [genre.genreId.id],
            castMembersId: [castMember.castMemberId.id],
          },
        ],
      });

      expected = new VideoSearchResult({
        items: [videos[3]],
        total: 3,
        currentPage: 2,
        perPage: 2,
      }).toJSON(true);

      searchOutput = await videoRepository.search(
        VideoSearchParams.create({
          page: 2,
          perPage: 2,
          filter: { title: 'TEST' },
        }),
      );

      expect(searchOutput.toJSON(true)).toMatchObject({
        ...expected,
        items: [
          {
            ...expected.items[0],
            categoriesId: [category.categoryID.id],
          },
        ],
      });
    });
  });

  describe('transaction mode', () => {
    describe('insert method', () => {
      it('should insert a genre', async () => {
        const { category, genre, castMember } = await createRelations();

        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        uow.start();

        await videoRepository.insert(video);
        await uow.commit();

        const videoCreated = await videoRepository.findByID(video.videoId);

        expect(video.videoId).toBeValueObject(videoCreated!.videoId);
      });

      it('should rollback the insert', async () => {
        const { category, genre, castMember } = await createRelations();

        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepository.insert(video);
        await uow.rollback();

        await expect(
          videoRepository.findByID(video.videoId),
        ).resolves.toBeNull();

        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });
    });

    describe('bulkInsert method', () => {
      it('should insert a list of videos', async () => {
        const { category, genre, castMember } = await createRelations();
        const videos = Video.fake()
          .theVideosWithAllMedias(2)
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();
        await uow.start();
        await videoRepository.bulkInsert(videos);
        await uow.commit();

        const [video1, video2] = await Promise.all([
          videoRepository.findByID(videos[0].videoId),
          videoRepository.findByID(videos[1].videoId),
        ]);
        expect(video1!.videoId).toBeValueObject(videos[0].videoId);
        expect(video2!.videoId).toBeValueObject(videos[1].videoId);
      });

      it('rollback the bulk insertion', async () => {
        const { category, genre, castMember } = await createRelations();
        const videos = Video.fake()
          .theVideosWithAllMedias(2)
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();
        await uow.start();
        await videoRepository.bulkInsert(videos);
        await uow.rollback();

        await expect(
          videoRepository.findByID(videos[0].videoId),
        ).resolves.toBeNull();
        await expect(
          videoRepository.findByID(videos[1].videoId),
        ).resolves.toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });
    });

    describe('update method', () => {
      it('should update a video', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();
        await videoRepository.insert(video);
        await uow.start();
        video.changeTitle('new title');
        await videoRepository.update(video);
        await uow.commit();
        const result = await videoRepository.findByID(video.videoId);
        expect(result!.title).toBe(video.title);
      });

      it('rollback the update', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();
        await videoRepository.insert(video);
        await uow.start();
        video.changeTitle('new title');
        await videoRepository.update(video);
        await uow.rollback();
        const notChangeVideo = await videoRepository.findByID(video.videoId);
        expect(notChangeVideo!.title).not.toBe(video.title);
      });
    });

    describe('delete method', () => {
      it('should delete a video', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();
        await videoRepository.insert(video);
        await uow.start();
        await videoRepository.delete(video.videoId);
        await uow.commit();
        await expect(
          videoRepository.findByID(video.videoId),
        ).resolves.toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });

      it('rollback the deletion', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
          .aVideoWithAllMedias()
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();
        await videoRepository.insert(video);
        await uow.start();
        await videoRepository.delete(video.videoId);
        await uow.rollback();
        const result = await videoRepository.findByID(video.videoId);
        expect(result!.videoId).toBeValueObject(video.videoId);
        await expect(VideoCategoryModel.count()).resolves.toBe(1);
        await expect(VideoGenreModel.count()).resolves.toBe(1);
        await expect(VideoCastMemberModel.count()).resolves.toBe(1);
        await expect(ImageMediaModel.count()).resolves.toBe(3);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(2);
      });
    });
    describe('search method', () => {
      it('should return a list of genres', async () => {
        const { category, genre, castMember } = await createRelations();
        const genres = Video.fake()
          .theVideosWithAllMedias(2)
          .withTitle('movie')
          .addCategoryId(category.categoryID)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();
        await uow.start();
        await videoRepository.bulkInsert(genres);
        const searchParams = VideoSearchParams.create({
          filter: { title: 'movie' },
        });
        const result = await videoRepository.search(searchParams);
        expect(result.items.length).toBe(2);
        expect(result.total).toBe(2);
        await uow.commit();
      });
    });
  });

  async function createRelations() {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(genre);

    const castMember = CastMember.fake().anActor().build();
    await castMemberRepository.insert(castMember);

    return { category, genre, castMember };
  }
});

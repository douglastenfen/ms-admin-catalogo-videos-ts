import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { RatingValues } from '@core/video/domain/rating.vo';
import { VideoId } from '@core/video/domain/video.aggregate';
import { DataType } from 'sequelize-typescript';
import {
  AudioVideoMediaModel,
  AudioVideoMediaRelatedField,
} from '../audio-video-media.model';
import {
  ImageMediaModel,
  ImageMediaVideoRelatedField,
} from '../image-media.model';
import { setupSequelizeForVideo } from '../testing/helper';
import {
  VideoCategoryModel,
  VideoGenreModel,
  VideoCastMemberModel,
  VideoModel,
} from '../video.model';

describe('VideoCategoryModel Unit Tests', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(VideoCategoryModel.tableName).toBe('category_video');
  });

  test('mapping props', () => {
    const attributesMap = VideoCategoryModel.getAttributes();
    const attributes = Object.keys(VideoCategoryModel.getAttributes());
    expect(attributes).toStrictEqual(['videoId', 'categoryId']);

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'videos',
        key: 'video_id',
      },
      unique: 'category_video_videoId_categoryId_unique',
    });

    const categoryIdAttr = attributesMap.categoryId;
    expect(categoryIdAttr).toMatchObject({
      field: 'category_id',
      fieldName: 'categoryId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'categories',
        key: 'category_id',
      },
      unique: 'category_video_videoId_categoryId_unique',
    });
  });
});

describe('VideoGenreModel Unit Tests', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(VideoGenreModel.tableName).toBe('genre_video');
  });

  test('mapping props', () => {
    const attributesMap = VideoGenreModel.getAttributes();
    const attributes = Object.keys(VideoGenreModel.getAttributes());
    expect(attributes).toStrictEqual(['videoId', 'genreId']);

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'videos',
        key: 'video_id',
      },
      unique: 'genre_video_videoId_genreId_unique',
    });

    const genreIdAttr = attributesMap.genreId;
    expect(genreIdAttr).toMatchObject({
      field: 'genre_id',
      fieldName: 'genreId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'genres',
        key: 'genre_id',
      },
      unique: 'genre_video_videoId_genreId_unique',
    });
  });
});

describe('VideoCastMemberModel Unit Tests', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(VideoCastMemberModel.tableName).toBe('cast_member_video');
  });

  test('mapping props', () => {
    const attributesMap = VideoCastMemberModel.getAttributes();
    const attributes = Object.keys(VideoCastMemberModel.getAttributes());
    expect(attributes).toStrictEqual(['videoId', 'castMemberId']);

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'videos',
        key: 'video_id',
      },
      unique: 'cast_member_video_videoId_castMemberId_unique',
    });

    const castMemberIdAttr = attributesMap.castMemberId;
    expect(castMemberIdAttr).toMatchObject({
      field: 'cast_member_id',
      fieldName: 'castMemberId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'cast_members',
        key: 'cast_member_id',
      },
      unique: 'cast_member_video_videoId_castMemberId_unique',
    });
  });
});

describe('VideoModel Unit Tests', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(VideoModel.tableName).toBe('videos');
  });

  test('mapping props', () => {
    const attributesMap = VideoModel.getAttributes();
    const attributes = Object.keys(VideoModel.getAttributes());
    expect(attributes).toStrictEqual([
      'videoId',
      'title',
      'description',
      'releasedYear',
      'duration',
      'rating',
      'isOpened',
      'isPublished',
      'createdAt',
    ]);

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const titleAttr = attributesMap.title;
    expect(titleAttr).toMatchObject({
      field: 'title',
      fieldName: 'title',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const descriptionAttr = attributesMap.description;
    expect(descriptionAttr).toMatchObject({
      field: 'description',
      fieldName: 'description',
      allowNull: false,
      type: DataType.TEXT(),
    });

    const yearLaunchedAttr = attributesMap.releasedYear;
    expect(yearLaunchedAttr).toMatchObject({
      field: 'released_year',
      fieldName: 'releasedYear',
      allowNull: false,
      type: DataType.INTEGER(),
    });

    const isOpenedAttr = attributesMap.isOpened;
    expect(isOpenedAttr).toMatchObject({
      field: 'is_opened',
      fieldName: 'isOpened',
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    const isPublishedAttr = attributesMap.isPublished;
    expect(isPublishedAttr).toMatchObject({
      field: 'is_published',
      fieldName: 'isPublished',
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    const ratingAttr = attributesMap.rating;
    expect(ratingAttr).toMatchObject({
      field: 'rating',
      fieldName: 'rating',
      allowNull: false,
      type: DataType.ENUM('L', '10', '12', '14', '16', '18'),
    });

    const durationAttr = attributesMap.duration;
    expect(durationAttr).toMatchObject({
      field: 'duration',
      fieldName: 'duration',
      allowNull: false,
      type: DataType.INTEGER(),
    });

    const createdAtAttr = attributesMap.createdAt;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'createdAt',
      allowNull: false,
      type: DataType.DATE(6),
    });
  });

  test('mapping associations', () => {
    const associationsMap = VideoModel.associations;
    const associations = Object.keys(associationsMap);
    expect(associations).toStrictEqual([
      'imageMedias',
      'audioVideoMedias',
      'categoriesId',
      'categories',
      'genresId',
      'genres',
      'castMembersId',
      'castMembers',
    ]);

    const imageMediasAttr = associationsMap.imageMedias;
    expect(imageMediasAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: ImageMediaModel,
      associationType: 'HasMany',
      options: {
        foreignKey: {
          name: 'videoId',
        },
      },
    });

    const audioVideoMediasAttr = associationsMap.audioVideoMedias;
    expect(audioVideoMediasAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: AudioVideoMediaModel,
      associationType: 'HasMany',
      options: {
        foreignKey: {
          name: 'videoId',
        },
      },
    });

    const categoriesIdAttr = associationsMap.categoriesId;
    expect(categoriesIdAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: VideoCategoryModel,
      associationType: 'HasMany',
      options: {
        foreignKey: { name: 'videoId' },
        as: 'categoriesId',
      },
    });

    const categoriesRelation = associationsMap.categories;
    expect(categoriesRelation).toMatchObject({
      associationType: 'BelongsToMany',
      source: VideoModel,
      target: CategoryModel,
      options: {
        through: { model: VideoCategoryModel },
        foreignKey: { name: 'videoId' },
        otherKey: { name: 'categoryId' },
        as: 'categories',
      },
    });

    const genresIdAttr = associationsMap.genresId;
    expect(genresIdAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: VideoGenreModel,
      associationType: 'HasMany',
      options: {
        foreignKey: { name: 'videoId' },
        as: 'genresId',
      },
    });

    const genresRelation = associationsMap.genres;
    expect(genresRelation).toMatchObject({
      associationType: 'BelongsToMany',
      source: VideoModel,
      target: GenreModel,
      options: {
        through: { model: VideoGenreModel },
        foreignKey: { name: 'videoId' },
        otherKey: { name: 'genreId' },
        as: 'genres',
      },
    });

    const castMembersIdAttr = associationsMap.castMembersId;
    expect(castMembersIdAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: VideoCastMemberModel,
      associationType: 'HasMany',
      options: {
        foreignKey: { name: 'videoId' },
        as: 'castMembersId',
      },
    });

    const castMembersRelation = associationsMap.castMembers;
    expect(castMembersRelation).toMatchObject({
      associationType: 'BelongsToMany',
      source: VideoModel,
      target: CastMemberModel,
      options: {
        through: { model: VideoCastMemberModel },
        foreignKey: { name: 'videoId' },
        otherKey: { name: 'castMemberId' },
        as: 'castMembers',
      },
    });
  });

  test('create and association relations separately ', async () => {
    const categoryRepo = new CategorySequelizeRepository(CategoryModel);
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);

    const genreRepo = new GenreSequelizeRepository(
      GenreModel,
      new UnitOfWorkFakeInMemory() as any,
    );
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepo.insert(genre);

    const castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);

    const videoProps = {
      videoId: new VideoId().id,
      title: 'title',
      description: 'description',
      releasedYear: 2020,
      duration: 90,
      rating: RatingValues.R10,
      isOpened: false,
      isPublished: false,
      createdAt: new Date(),
    };

    const video = await VideoModel.create(videoProps as any);

    await video.$add('categories', [category.categoryID.id]);
    const videoWithCategories = await VideoModel.findByPk(video.videoId, {
      include: ['categoriesId'],
    });
    expect(videoWithCategories).toMatchObject(videoProps);
    expect(videoWithCategories!.categoriesId).toHaveLength(1);
    expect(videoWithCategories!.categoriesId[0]).toBeInstanceOf(
      VideoCategoryModel,
    );
    expect(videoWithCategories!.categoriesId[0].categoryId).toBe(
      category.categoryID.id,
    );
    expect(videoWithCategories!.categoriesId[0].videoId).toBe(video.videoId);

    await video.$add('genres', [genre.genreId.id]);
    const videoWithGenres = await VideoModel.findByPk(video.videoId, {
      include: ['genresId'],
    });
    expect(videoWithGenres).toMatchObject(videoProps);
    expect(videoWithGenres!.genresId).toHaveLength(1);
    expect(videoWithGenres!.genresId[0]).toBeInstanceOf(VideoGenreModel);
    expect(videoWithGenres!.genresId[0].genreId).toBe(genre.genreId.id);
    expect(videoWithGenres!.genresId[0].videoId).toBe(video.videoId);

    await video.$add('castMembers', [castMember.castMemberId.id]);
    const videoWithCastMembers = await VideoModel.findByPk(video.videoId, {
      include: ['castMembersId'],
    });
    expect(videoWithCastMembers).toMatchObject(videoProps);
    expect(videoWithCastMembers!.castMembersId).toHaveLength(1);
    expect(videoWithCastMembers!.castMembersId[0]).toBeInstanceOf(
      VideoCastMemberModel,
    );
    expect(videoWithCastMembers!.castMembersId[0].castMemberId).toBe(
      castMember.castMemberId.id,
    );
    expect(videoWithCastMembers!.castMembersId[0].videoId).toBe(video.videoId);

    await video.$create('imageMedia', {
      name: 'name',
      location: 'location',
      videoRelatedField: ImageMediaVideoRelatedField.BANNER,
    });
    const videoWithImageMedias = await VideoModel.findByPk(video.videoId, {
      include: ['imageMedias'],
    });
    expect(videoWithImageMedias).toMatchObject(videoProps);
    expect(videoWithImageMedias!.imageMedias).toHaveLength(1);
    expect(videoWithImageMedias!.imageMedias[0].toJSON()).toMatchObject({
      name: 'name',
      location: 'location',
      videoId: video.videoId,
      videoRelatedField: ImageMediaVideoRelatedField.BANNER,
    });

    await video.$create('audioVideoMedia', {
      name: 'name',
      rawLocation: 'location',
      videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
      status: AudioVideoMediaStatus.COMPLETED,
    });
    const videoWithAudioVideoMedias = await VideoModel.findByPk(video.videoId, {
      include: ['audioVideoMedias'],
    });
    expect(videoWithAudioVideoMedias).toMatchObject(videoProps);
    expect(videoWithAudioVideoMedias!.audioVideoMedias).toHaveLength(1);
    expect(
      videoWithAudioVideoMedias!.audioVideoMedias[0].toJSON(),
    ).toMatchObject({
      name: 'name',
      rawLocation: 'location',
      videoId: video.videoId,
      videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  });

  test('create and association in single transaction ', async () => {
    const categoryRepo = new CategorySequelizeRepository(CategoryModel);
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);

    const genreRepo = new GenreSequelizeRepository(
      GenreModel,
      new UnitOfWorkFakeInMemory() as any,
    );
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepo.insert(genre);

    const castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);

    const videoProps = {
      videoId: new VideoId().id,
      title: 'title',
      description: 'description',
      releasedYear: 2020,
      duration: 90,
      rating: RatingValues.R10,
      isOpened: false,
      isPublished: false,
      createdAt: new Date(),
    };

    const video = await VideoModel.create(
      {
        ...videoProps,
        categoriesId: [
          VideoCategoryModel.build({
            categoryId: category.categoryID.id,
            videoId: videoProps.videoId,
          }),
        ],
        genresId: [
          VideoGenreModel.build({
            genreId: genre.genreId.id,
            videoId: videoProps.videoId,
          }),
        ],
        castMembersId: [
          VideoCastMemberModel.build({
            castMemberId: castMember.castMemberId.id,
            videoId: videoProps.videoId,
          }),
        ],
        imageMedias: [
          ImageMediaModel.build({
            name: 'name',
            location: 'location',
            videoRelatedField: ImageMediaVideoRelatedField.BANNER,
          } as any),
        ],
        audioVideoMedias: [
          AudioVideoMediaModel.build({
            name: 'name',
            rawLocation: 'location',
            videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
            status: AudioVideoMediaStatus.COMPLETED,
          } as any),
        ],
      },
      {
        include: [
          'categoriesId',
          'genresId',
          'castMembersId',
          'imageMedias',
          'audioVideoMedias',
        ],
      },
    );

    const videoWithRelations = await VideoModel.findByPk(video.videoId, {
      include: [
        'categoriesId',
        'genresId',
        'castMembersId',
        'imageMedias',
        'audioVideoMedias',
      ],
    });
    expect(videoWithRelations).toMatchObject(videoProps);
    expect(videoWithRelations!.categoriesId).toHaveLength(1);
    expect(videoWithRelations!.categoriesId[0]).toBeInstanceOf(
      VideoCategoryModel,
    );
    expect(videoWithRelations!.categoriesId[0].categoryId).toBe(
      category.categoryID.id,
    );
    expect(videoWithRelations!.categoriesId[0].videoId).toBe(video.videoId);
    expect(videoWithRelations!.genresId).toHaveLength(1);
    expect(videoWithRelations!.genresId[0]).toBeInstanceOf(VideoGenreModel);
    expect(videoWithRelations!.genresId[0].genreId).toBe(genre.genreId.id);
    expect(videoWithRelations!.genresId[0].videoId).toBe(video.videoId);
    expect(videoWithRelations!.castMembersId).toHaveLength(1);
    expect(videoWithRelations!.castMembersId[0]).toBeInstanceOf(
      VideoCastMemberModel,
    );
    expect(videoWithRelations!.castMembersId[0].castMemberId).toBe(
      castMember.castMemberId.id,
    );
    expect(videoWithRelations!.castMembersId[0].videoId).toBe(video.videoId);
    expect(videoWithRelations!.imageMedias).toHaveLength(1);
    expect(videoWithRelations!.imageMedias[0].toJSON()).toMatchObject({
      name: 'name',
      location: 'location',
      videoId: video.videoId,
      videoRelatedField: ImageMediaVideoRelatedField.BANNER,
    });
    expect(videoWithRelations!.audioVideoMedias).toHaveLength(1);
    expect(videoWithRelations!.audioVideoMedias[0].toJSON()).toMatchObject({
      name: 'name',
      rawLocation: 'location',
      videoId: video.videoId,
      videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  });
});

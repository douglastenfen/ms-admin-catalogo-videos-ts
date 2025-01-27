import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { setupSequelizeForVideo } from '../testing/helper';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../video.model';
import { Rating, RatingValues } from '@core/video/domain/rating.vo';
import { VideoModelMapper } from '../video.model.mapper';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import {
  ImageMediaModel,
  ImageMediaVideoRelatedField,
} from '../image-media.model';
import {
  AudioVideoMediaModel,
  AudioVideoMediaRelatedField,
} from '../audio-video-media.model';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { Banner } from '@core/video/domain/banner.vo';
import { Thumbnail } from '@core/video/domain/thumbnail.vo';
import { ThumbnailHalf } from '@core/video/domain/thumbnail-half.vo';
import { Trailer } from '@core/video/domain/trailer.vo';
import { VideoMedia } from '@core/video/domain/video-media.vo';

describe('VideoModelMapper Unit Tests', () => {
  let categoryRepository: ICategoryRepository;
  let genreRepository: IGenreRepository;
  let castMemberRepository: ICastMemberRepository;

  setupSequelizeForVideo();

  beforeEach(() => {
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    genreRepository = new GenreSequelizeRepository(
      GenreModel,
      new UnitOfWorkFakeInMemory() as any,
    );
  });

  it('should throw error when video is invalid', () => {
    const arrange = [
      {
        makeModel: () => {
          return VideoModel.build({
            videoId: '9366b7dc-2d71-4799-b91c-c64adb205104',
            title: 't'.repeat(256),
            categoriesId: [],
            genresId: [],
            castMembersId: [],
          } as any);
        },
        expectedErrors: [
          {
            categoriesId: ['categoriesId should not be empty'],
          },
          {
            genresId: ['genresId should not be empty'],
          },
          {
            castMembersId: ['castMembersId should not be empty'],
          },
          {
            rating: [
              `The rating must be one of the following values: ${Object.values(
                RatingValues,
              ).join(', ')} passed value: undefined`,
            ],
          },
          {
            title: ['title must be shorter than or equal to 255 characters'],
          },
        ],
      },
    ];

    for (const item of arrange) {
      try {
        VideoModelMapper.toEntity(item.makeModel());
        fail('The genre is valid, but it needs throws a LoadEntityError');
      } catch (e) {
        expect(e).toBeInstanceOf(LoadEntityError);
        expect(e.error).toMatchObject(item.expectedErrors);
      }
    }
  });

  it('should convert a video model to a video entity', async () => {
    const category1 = Category.fake().aCategory().build();
    await categoryRepository.bulkInsert([category1]);

    const genre1 = Genre.fake()
      .aGenre()
      .addCategoriesId(category1.categoryID)
      .build();
    await genreRepository.bulkInsert([genre1]);

    const castMember1 = CastMember.fake().anActor().build();
    await castMemberRepository.bulkInsert([castMember1]);

    const videoProps = {
      videoId: new VideoId().id,
      title: 'title',
      description: 'description',
      releasedYear: 2020,
      duration: 120,
      rating: RatingValues.R10,
      isOpened: false,
      isPublished: false,
      createdAt: new Date(),
    };

    let model = await VideoModel.create(
      {
        ...videoProps,
        categoriesId: [
          VideoCategoryModel.build({
            videoId: videoProps.videoId,
            categoryId: category1.categoryID.id,
          }),
        ],
        genresId: [
          VideoGenreModel.build({
            videoId: videoProps.videoId,
            genreId: genre1.genreId.id,
          }),
        ],
        castMembersId: [
          VideoCastMemberModel.build({
            videoId: videoProps.videoId,
            castMemberId: castMember1.castMemberId.id,
          }),
        ],
      } as any,
      { include: ['categoriesId', 'genresId', 'castMembersId'] },
    );

    let entity = VideoModelMapper.toEntity(model);

    expect(entity.toJSON()).toEqual(
      new Video({
        videoId: new VideoId(videoProps.videoId),
        title: videoProps.title,
        description: videoProps.description,
        releasedYear: videoProps.releasedYear,
        duration: videoProps.duration,
        rating: Rating.createR10(),
        isOpened: videoProps.isOpened,
        isPublished: videoProps.isPublished,
        createdAt: videoProps.createdAt,
        categoriesId: new Map([
          [category1.categoryID.id, category1.categoryID],
        ]),
        genresId: new Map([[genre1.genreId.id, genre1.genreId]]),
        castMembersId: new Map([
          [castMember1.castMemberId.id, castMember1.castMemberId],
        ]),
      }).toJSON(),
    );

    videoProps.videoId = new VideoId().id;

    model = await VideoModel.create(
      {
        ...videoProps,
        imageMedias: [
          ImageMediaModel.build({
            videoId: videoProps.videoId,
            location: 'location banner',
            name: 'name banner',
            videoRelatedField: ImageMediaVideoRelatedField.BANNER,
          } as any),
          ImageMediaModel.build({
            videoId: videoProps.videoId,
            location: 'location thumbnail',
            name: 'name thumbnail',
            videoRelatedField: ImageMediaVideoRelatedField.THUMBNAIL,
          } as any),
          ImageMediaModel.build({
            videoId: videoProps.videoId,
            location: 'location thumbnail half',
            name: 'name thumbnail half',
            videoRelatedField: ImageMediaVideoRelatedField.THUMBNAIL_HALF,
          } as any),
        ],
        audioVideoMedias: [
          AudioVideoMediaModel.build({
            videoId: videoProps.videoId,
            name: 'name trailer',
            rawLocation: 'raw location trailer',
            encodedLocation: 'encoded location trailer',
            status: AudioVideoMediaStatus.COMPLETED,
            videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
          } as any),
          AudioVideoMediaModel.build({
            videoId: videoProps.videoId,
            name: 'name video',
            rawLocation: 'raw location video',
            encodedLocation: 'encoded location video',
            status: AudioVideoMediaStatus.COMPLETED,
            videoRelatedField: AudioVideoMediaRelatedField.VIDEO,
          } as any),
        ],
        categoriesId: [
          VideoCategoryModel.build({
            videoId: videoProps.videoId,
            categoryId: category1.categoryID.id,
          }),
        ],
        genresId: [
          VideoGenreModel.build({
            videoId: videoProps.videoId,
            genreId: genre1.genreId.id,
          }),
        ],
        castMembersId: [
          VideoCastMemberModel.build({
            videoId: videoProps.videoId,
            castMemberId: castMember1.castMemberId.id,
          }),
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

    entity = VideoModelMapper.toEntity(model);

    expect(entity.toJSON()).toEqual(
      new Video({
        videoId: new VideoId(model.videoId),
        title: videoProps.title,
        description: videoProps.description,
        releasedYear: videoProps.releasedYear,
        duration: videoProps.duration,
        rating: Rating.createR10(),
        isOpened: videoProps.isOpened,
        isPublished: videoProps.isPublished,
        createdAt: videoProps.createdAt,
        banner: new Banner({
          location: 'location banner',
          name: 'name banner',
        }),
        thumbnail: new Thumbnail({
          location: 'location thumbnail',
          name: 'name thumbnail',
        }),
        thumbnailHalf: new ThumbnailHalf({
          location: 'location thumbnail half',
          name: 'name thumbnail half',
        }),
        trailer: new Trailer({
          name: 'name trailer',
          rawLocation: 'raw location trailer',
          encodedLocation: 'encoded location trailer',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
        video: new VideoMedia({
          name: 'name video',
          rawLocation: 'raw location video',
          encodedLocation: 'encoded location video',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
        categoriesId: new Map([
          [category1.categoryID.id, category1.categoryID],
        ]),
        genresId: new Map([[genre1.genreId.id, genre1.genreId]]),
        castMembersId: new Map([
          [castMember1.castMemberId.id, castMember1.castMemberId],
        ]),
      }).toJSON(),
    );
  });

  it('should convert a video entity to a video model', async () => {
    const category1 = Category.fake().aCategory().build();
    await categoryRepository.bulkInsert([category1]);
    const genre1 = Genre.fake()
      .aGenre()
      .addCategoriesId(category1.categoryID)
      .build();
    await genreRepository.bulkInsert([genre1]);
    const castMember1 = CastMember.fake().anActor().build();
    await castMemberRepository.bulkInsert([castMember1]);

    const videoProps = {
      videoId: new VideoId(),
      title: 'title',
      description: 'description',
      releasedYear: 2020,
      duration: 90,
      rating: Rating.createR10(),
      isOpened: false,
      isPublished: false,
      createdAt: new Date(),
    };

    let entity = new Video({
      ...videoProps,
      categoriesId: new Map([[category1.categoryID.id, category1.categoryID]]),
      genresId: new Map([[genre1.genreId.id, genre1.genreId]]),
      castMembersId: new Map([
        [castMember1.castMemberId.id, castMember1.castMemberId],
      ]),
    });

    const model = VideoModelMapper.toModelProps(entity);
    expect(model).toEqual({
      videoId: videoProps.videoId.id,
      title: videoProps.title,
      description: videoProps.description,
      releasedYear: videoProps.releasedYear,
      duration: videoProps.duration,
      rating: videoProps.rating.value,
      isOpened: videoProps.isOpened,
      isPublished: videoProps.isPublished,
      createdAt: videoProps.createdAt,
      audioVideoMedias: [],
      imageMedias: [],
      categoriesId: [
        VideoCategoryModel.build({
          videoId: videoProps.videoId.id,
          categoryId: category1.categoryID.id,
        }),
      ],
      genresId: [
        VideoGenreModel.build({
          videoId: videoProps.videoId.id,
          genreId: genre1.genreId.id,
        }),
      ],
      castMembersId: [
        VideoCastMemberModel.build({
          videoId: videoProps.videoId.id,
          castMemberId: castMember1.castMemberId.id,
        }),
      ],
    });

    entity = new Video({
      ...videoProps,
      banner: new Banner({
        location: 'location banner',
        name: 'name banner',
      }),
      thumbnail: new Thumbnail({
        location: 'location thumbnail',
        name: 'name thumbnail',
      }),
      thumbnailHalf: new ThumbnailHalf({
        location: 'location thumbnail half',
        name: 'name thumbnail half',
      }),
      trailer: new Trailer({
        name: 'name trailer',
        rawLocation: 'raw location trailer',
        encodedLocation: 'encoded location trailer',
        status: AudioVideoMediaStatus.COMPLETED,
      }),
      video: new VideoMedia({
        name: 'name video',
        rawLocation: 'raw location video',
        encodedLocation: 'encoded location video',
        status: AudioVideoMediaStatus.COMPLETED,
      }),
      categoriesId: new Map([[category1.categoryID.id, category1.categoryID]]),
      genresId: new Map([[genre1.genreId.id, genre1.genreId]]),
      castMembersId: new Map([
        [castMember1.castMemberId.id, castMember1.castMemberId],
      ]),
    });

    const model2 = VideoModelMapper.toModelProps(entity);

    expect(model2.videoId).toEqual(videoProps.videoId.id);
    expect(model2.title).toEqual(videoProps.title);
    expect(model2.description).toEqual(videoProps.description);
    expect(model2.releasedYear).toEqual(videoProps.releasedYear);
    expect(model2.duration).toEqual(videoProps.duration);
    expect(model2.rating).toEqual(videoProps.rating.value);
    expect(model2.isOpened).toEqual(videoProps.isOpened);
    expect(model2.isPublished).toEqual(videoProps.isPublished);
    expect(model2.createdAt).toEqual(videoProps.createdAt);
    expect(model2.audioVideoMedias[0]!.toJSON()).toEqual({
      audioVideoMediaId: model2.audioVideoMedias[0]!.audioVideoMediaId,
      videoId: videoProps.videoId.id,
      name: 'name trailer',
      rawLocation: 'raw location trailer',
      encodedLocation: 'encoded location trailer',
      status: AudioVideoMediaStatus.COMPLETED,
      videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
    });
    expect(model2.audioVideoMedias[1]!.toJSON()).toEqual({
      audioVideoMediaId: model2.audioVideoMedias[1]!.audioVideoMediaId,
      videoId: videoProps.videoId.id,
      name: 'name video',
      rawLocation: 'raw location video',
      encodedLocation: 'encoded location video',
      status: AudioVideoMediaStatus.COMPLETED,
      videoRelatedField: AudioVideoMediaRelatedField.VIDEO,
    });
    expect(model2.imageMedias[0]!.toJSON()).toEqual({
      imageMediaId: model2.imageMedias[0]!.imageMediaId,
      videoId: videoProps.videoId.id,
      location: 'location banner',
      name: 'name banner',
      videoRelatedField: ImageMediaVideoRelatedField.BANNER,
    });
    expect(model2.imageMedias[1]!.toJSON()).toEqual({
      imageMediaId: model2.imageMedias[1]!.imageMediaId,
      videoId: videoProps.videoId.id,
      location: 'location thumbnail',
      name: 'name thumbnail',
      videoRelatedField: ImageMediaVideoRelatedField.THUMBNAIL,
    });
    expect(model2.imageMedias[2]!.toJSON()).toEqual({
      imageMediaId: model2.imageMedias[2]!.imageMediaId,
      videoId: videoProps.videoId.id,
      location: 'location thumbnail half',
      name: 'name thumbnail half',
      videoRelatedField: ImageMediaVideoRelatedField.THUMBNAIL_HALF,
    });
    expect(model2.categoriesId[0].toJSON()).toEqual({
      videoId: videoProps.videoId.id,
      categoryId: category1.categoryID.id,
    });
    expect(model2.genresId[0].toJSON()).toEqual({
      videoId: videoProps.videoId.id,
      genreId: genre1.genreId.id,
    });
    expect(model2.castMembersId[0].toJSON()).toEqual({
      videoId: videoProps.videoId.id,
      castMemberId: castMember1.castMemberId.id,
    });
  });
});

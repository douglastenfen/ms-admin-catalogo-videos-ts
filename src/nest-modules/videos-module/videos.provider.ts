import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ApplicationService } from '@core/shared/application/application.service';
import { IStorage } from '@core/shared/application/sotarge.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';
import { ProcessAudioVideoMediaUseCase } from '@core/video/application/use-cases/process-audio-video-medias/process-audio-video-media.use-case';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediaUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-media.use-case';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { VideoInMemoryRepository } from '@core/video/infra/db/in-memory/video-in-memory.repository';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { getModelToken } from '@nestjs/sequelize';
import { CAST_MEMBER_PROVIDERS } from '../cast-members-module/cast-members.provider';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.provider';
import { GENRES_PROVIDERS } from '../genres-module/genres.provider';
import { PublishVideoMediaReplacedInQueueHandler } from '@core/video/application/handlers/publish-video-media-replaced-in-queue.handler';

export const REPOSITORIES = {
  VIDEO_REPOSITORY: {
    provide: 'VideoRepository',
    useExisting: VideoSequelizeRepository,
  },
  VIDEO_IN_MEMORY_REPOSITORY: {
    provide: VideoInMemoryRepository,
    useClass: VideoInMemoryRepository,
  },
  VIDEO_SEQUELIZE_REPOSITORY: {
    provide: VideoSequelizeRepository,
    useFactory: (videoModel: typeof VideoModel, uow: UnitOfWorkSequelize) => {
      return new VideoSequelizeRepository(videoModel, uow);
    },
    inject: [getModelToken(VideoModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_VIDEO_USE_CASE: {
    provide: CreateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepository: IVideoRepository,
      categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
      genresIdValidator: GenresIdExistsInDatabaseValidator,
      castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
    ) => {
      return new CreateVideoUseCase(
        uow,
        videoRepository,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      CAST_MEMBER_PROVIDERS.VALIDATIONS
        .CAST_MEMBERS_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  UPDATE_VIDEO_USE_CASE: {
    provide: UpdateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepository: IVideoRepository,
      categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
      genresIdValidator: GenresIdExistsInDatabaseValidator,
      castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
    ) => {
      return new UpdateVideoUseCase(
        uow,
        videoRepository,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      CAST_MEMBER_PROVIDERS.VALIDATIONS
        .CAST_MEMBERS_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: UploadAudioVideoMediaUseCase,
    useFactory: (
      appService: ApplicationService,
      videoRepository: IVideoRepository,
      storage: IStorage,
    ) => {
      return new UploadAudioVideoMediaUseCase(
        appService,
        videoRepository,
        storage,
      );
    },
    inject: [
      ApplicationService,
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      'IStorage',
    ],
  },
  GET_VIDEO_USE_CASE: {
    provide: GetVideoUseCase,
    useFactory: (
      videoRepository: IVideoRepository,
      categoryRepository: ICategoryRepository,
      genreRepository: IGenreRepository,
      castMemberRepository: ICastMemberRepository,
    ) => {
      return new GetVideoUseCase(
        videoRepository,
        categoryRepository,
        genreRepository,
        castMemberRepository,
      );
    },
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  COMPLETE_PROCESS_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: ProcessAudioVideoMediaUseCase,
    useFactory: (uow: IUnitOfWork, videoRepository: IVideoRepository) => {
      return new ProcessAudioVideoMediaUseCase(uow, videoRepository);
    },
    inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
  },
};

export const HANDLERS = {
  PUBLISH_VIDEO_MEDIA_REPLACED_IN_QUEUE_HANDLER: {
    provide: PublishVideoMediaReplacedInQueueHandler,
    useClass: PublishVideoMediaReplacedInQueueHandler,
  },
};

export const VIDEOS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  HANDLERS,
};

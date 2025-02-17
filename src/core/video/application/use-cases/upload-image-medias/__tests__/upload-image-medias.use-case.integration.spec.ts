import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { IStorage } from '@core/shared/application/sotarge.interface';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { UploadImageMediasUseCase } from '../upload-image-medias.use-case';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helper';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { InMemoryStorage } from '@core/shared/infra/storage/in-memory.storage';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Video } from '@core/video/domain/video.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Config } from '@core/shared/infra/config';
import { GoogleCloudStorage } from '@core/shared/infra/storage/google-cloud.storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';

describe('UploadImageMediasUseCase Integration Tests', () => {
  let uploadImageMediasUseCase: UploadImageMediasUseCase;
  let videoRepository: IVideoRepository;
  let categoryRepository: ICategoryRepository;
  let genreRepository: IGenreRepository;
  let castMemberRepository: ICastMemberRepository;
  let uow: UnitOfWorkSequelize;
  let storageService: IStorage;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);

    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    videoRepository = new VideoSequelizeRepository(VideoModel, uow);

    // storageService = new InMemoryStorage();
    const storageSdk = new GoogleCloudStorageSdk({
      credentials: Config.googleCredentials(),
    });

    storageService = new GoogleCloudStorage(storageSdk, Config.bucketName());

    uploadImageMediasUseCase = new UploadImageMediasUseCase(
      videoRepository,
      uow,
      storageService,
    );
  });

  it('should throw an error when video does not exist', async () => {
    await expect(
      uploadImageMediasUseCase.execute({
        videoId: '4f4e3b2d-1b1b-4b4b-8b8b-2b2b1b1b1b1b',
        field: 'banner',
        file: {
          rawName: 'banner.jpg',
          data: Buffer.from(''),
          mimeType: 'image/jpg',
          size: 100,
        },
      }),
    ).rejects.toThrow(
      new NotFoundError('4f4e3b2d-1b1b-4b4b-8b8b-2b2b1b1b1b1b', Video),
    );
  });

  it('should throw an error when image is invalid', async () => {
    expect.assertions(2);

    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(genre);

    const castMember = CastMember.fake().anActor().build();
    await castMemberRepository.insert(castMember);

    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.insert(video);

    try {
      await uploadImageMediasUseCase.execute({
        videoId: video.videoId.id,
        field: 'banner',
        file: {
          rawName: 'banner.jpg',
          data: Buffer.from(''),
          mimeType: 'image/jpg',
          size: 100,
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.error).toEqual([
        {
          banner: [
            'Invalid media file mime type: image/jpg not in image/jpeg, image/png, image/gif',
          ],
        },
      ]);
    }
  }, 10000);

  it('should upload banner image', async () => {
    const storeSpy = jest.spyOn(storageService, 'store');
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepository.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.categoryID)
      .addGenreId(genre.genreId)
      .addCastMemberId(castMember.castMemberId)
      .build();

    await videoRepository.insert(video);

    await uploadImageMediasUseCase.execute({
      videoId: video.videoId.id,
      field: 'banner',
      file: {
        rawName: 'banner.jpg',
        data: Buffer.from('test data'),
        mimeType: 'image/jpeg',
        size: 100,
      },
    });

    const videoUpdated = await videoRepository.findByID(video.videoId);
    expect(videoUpdated!.banner).toBeDefined();
    expect(videoUpdated!.banner!.name.includes('.jpg')).toBeTruthy();
    expect(videoUpdated!.banner!.location).toBe(
      `videos/${videoUpdated!.videoId.id}/images`,
    );
    expect(storeSpy).toHaveBeenCalledWith({
      data: Buffer.from('test data'),
      id: videoUpdated!.banner!.url,
      mimeType: 'image/jpeg',
    });
  }, 10000);
});

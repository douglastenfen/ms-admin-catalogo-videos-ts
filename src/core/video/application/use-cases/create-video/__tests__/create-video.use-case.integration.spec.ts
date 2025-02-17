import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helper';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { CreateVideoUseCase } from '../create-video.use-case';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { RatingValues } from '@core/video/domain/rating.vo';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { DatabaseError } from 'sequelize';

describe('CreateVideoUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateVideoUseCase;

  let videoRepository: VideoSequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let castMemberRepository: CastMemberSequelizeRepository;

  let genresIdsValidator: GenresIdExistsInDatabaseValidator;
  let categoriesIdsValidator: CategoriesIdExistsInDatabaseValidator;
  let castMembersIdsValidator: CastMembersIdExistsInDatabaseValidator;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepository = new VideoSequelizeRepository(VideoModel, uow);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);

    genresIdsValidator = new GenresIdExistsInDatabaseValidator(genreRepository);
    categoriesIdsValidator = new CategoriesIdExistsInDatabaseValidator(
      categoryRepository,
    );
    castMembersIdsValidator = new CastMembersIdExistsInDatabaseValidator(
      castMemberRepository,
    );

    useCase = new CreateVideoUseCase(
      uow,
      videoRepository,
      categoriesIdsValidator,
      genresIdsValidator,
      castMembersIdsValidator,
    );
  });

  it('should create a video', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const categoriesId = categories.map((category) => category.categoryID.id);

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].categoryID]);
    genres[1].syncCategoriesId([categories[1].categoryID]);
    await genreRepository.bulkInsert(genres);
    const genresId = genres.map((genre) => genre.genreId.id);

    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepository.bulkInsert(castMembers);
    const castMembersId = castMembers.map((c) => c.castMemberId.id);

    const output = await useCase.execute({
      title: 'test video',
      description: 'test description',
      releasedYear: 2021,
      duration: 120,
      rating: RatingValues.R10,
      isOpened: true,
      categoriesId,
      genresId,
      castMembersId,
    });

    expect(output).toStrictEqual({
      id: expect.any(String),
    });

    const video = await videoRepository.findByID(new VideoId(output.id));

    expect(video!.toJSON()).toStrictEqual({
      videoId: expect.any(String),
      title: 'test video',
      description: 'test description',
      releasedYear: 2021,
      duration: 120,
      rating: RatingValues.R10,
      isOpened: true,
      isPublished: false,
      banner: null,
      thumbnail: null,
      thumbnailHalf: null,
      trailer: null,
      video: null,
      categoriesId: expect.arrayContaining(categoriesId),
      genresId: expect.arrayContaining(genresId),
      castMembersId: expect.arrayContaining(castMembersId),
      createdAt: expect.any(Date),
    });
  });

  test('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const categoriesId = categories.map((category) => category.categoryID.id);

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].categoryID]);
    genres[1].syncCategoriesId([categories[1].categoryID]);
    await genreRepository.bulkInsert(genres);
    const genresId = genres.map((genre) => genre.genreId.id);

    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepository.bulkInsert(castMembers);
    const castMembersId = castMembers.map((c) => c.castMemberId.id);

    const video = Video.fake().aVideoWithoutMedias().build();
    video.title = 't'.repeat(256);

    const mockCreate = jest
      .spyOn(Video, 'create')
      .mockImplementation(() => video);

    await expect(
      useCase.execute({
        title: 'test video',
        rating: RatingValues.R10,
        categoriesId,
        genresId,
        castMembersId,
      } as any),
    ).rejects.toThrow(DatabaseError);

    const videos = await videoRepository.findAll();
    expect(videos).toHaveLength(0);

    mockCreate.mockRestore();
  });
});

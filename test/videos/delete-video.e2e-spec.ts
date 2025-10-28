import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { CAST_MEMBER_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.provider';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.provider';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import { VIDEOS_PROVIDERS } from 'src/nest-modules/videos-module/videos.provider';
import request from 'supertest';

describe('VideosController (e2e)', () => {
  describe('/videos/:id (DELETE)', () => {
    const appHelper = startApp();

    describe('when video does not exist', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Video Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake-id',
          expected: {
            message: 'Validation failed (uuid is expected)',
            statusCode: 422,
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .delete(`/videos/${id}`)
          .authenticate(appHelper.app)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should delete video and return 204', async () => {
      const videoRepository = appHelper.app.get<IVideoRepository>(
        VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
      );

      const categoryRepository = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );

      const genreRepository = appHelper.app.get<IGenreRepository>(
        GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      );

      const castMemberRepository = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );

      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake().aGenre().build();
      genre.syncCategoriesId([category.categoryID]);
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

      await request(appHelper.app.getHttpServer())
        .delete(`/videos/${video.videoId.id}`)
        .authenticate(appHelper.app)
        .expect(204);

      await expect(
        videoRepository.findByID(video.videoId),
      ).resolves.toBeNull();
    });
  });
});

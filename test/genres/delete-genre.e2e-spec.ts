import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.provider';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('GenresController (e2e)', () => {
  describe('/delete/:id (DELETE)', () => {
    const nestApp = startApp();
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          genreId: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Genre Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          genreId: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $genreId',
        async ({ genreId, expected }) => {
          return request(nestApp.app.getHttpServer())
            .delete(`/genres/${genreId}`)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    it('should delete a category response with status 204', async () => {
      const genreRepo = nestApp.app.get<IGenreRepository>(
        GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      );

      const categoryRepo = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );

      const category = Category.fake().aCategory().build();

      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoriesId(category.categoryID)
        .build();
      await genreRepo.insert(genre);

      await request(nestApp.app.getHttpServer())
        .delete(`/genres/${genre.genreId.id}`)
        .expect(204);

      await expect(genreRepo.findByID(genre.genreId)).resolves.toBeNull();
    });
  });
});

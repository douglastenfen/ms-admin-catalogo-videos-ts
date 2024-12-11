import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { GenreOutputMapper } from '@core/genre/application/use-cases/common/genre-output';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { instanceToPlain } from 'class-transformer';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.provider';
import { GenresController } from 'src/nest-modules/genres-module/genres.controller';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { GetGenreFixture } from 'src/nest-modules/genres-module/testing/genre-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('GenresController (e2e)', () => {
  const nestApp = startApp();

  describe('/genres/:id (GET)', () => {
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
            .get(`/genres/${genreId}`)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    it('should return a genre ', async () => {
      const genreRepo = nestApp.app.get<IGenreRepository>(
        GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      );

      const categoryRepo = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );

      const categories = Category.fake().theCategories(3).build();

      await categoryRepo.bulkInsert(categories);

      const genre = Genre.fake()
        .aGenre()
        .addCategoriesId(categories[0].categoryID)
        .addCategoriesId(categories[1].categoryID)
        .addCategoriesId(categories[2].categoryID)
        .build();
      await genreRepo.insert(genre);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/genres/${genre.genreId.id}`)
        .expect(200);

      const keyInResponse = GetGenreFixture.keysInResponse;

      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = GenresController.serialize(
        GenreOutputMapper.toOutput(genre, categories),
      );

      const serialized = instanceToPlain(presenter);

      serialized.categoriesId = expect.arrayContaining(serialized.categoriesId);

      serialized.categories = expect.arrayContaining(
        serialized.categories.map((category) => ({
          categoryId: category.categoryId,
          name: category.name,
          createdAt: category.createdAt,
        })),
      );

      expect(res.body.data).toEqual(serialized);
    });
  });
});

import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { GenreOutputMapper } from '@core/genre/application/use-cases/common/genre-output';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { instanceToPlain } from 'class-transformer';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.provider';
import { GenresController } from 'src/nest-modules/genres-module/genres.controller';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { UpdateGenreFixture } from 'src/nest-modules/genres-module/testing/genre-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('GenresController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('/genres/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const nestApp = startApp();

      const faker = Genre.fake().aGenre();

      const arrange = [
        {
          genreId: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          sendData: { name: faker.name },
          expected: {
            message:
              'Genre Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          genreId: 'fake id',
          sendData: { name: faker.name },
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $genreId',
        async ({ genreId, sendData, expected }) => {
          return request(nestApp.app.getHttpServer())
            .patch(`/genres/${genreId}`)
            .send(sendData)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('should a response error with 422 when request body is invalid', () => {
      const app = startApp();

      const invalidRequest = UpdateGenreFixture.arrangeInvalidRequest();

      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .patch(`/genres/${uuid}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();

      const validationErrors =
        UpdateGenreFixture.arrangeForEntityValidationError();

      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));

      let genreRepository: IGenreRepository;
      let categoryRepository: ICategoryRepository;

      beforeEach(() => {
        genreRepository = app.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );

        categoryRepository = app.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().aCategory().build();

        await categoryRepository.insert(category);
        const genre = Genre.fake()

          .aGenre()
          .addCategoriesId(category.categoryID)
          .build();
        await genreRepository.insert(genre);

        return request(app.app.getHttpServer())
          .patch(`/genres/${genre.genreId.id}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a genre', () => {
      const app = startApp();

      const arrange = UpdateGenreFixture.arrangeForSave();

      let genreRepository: IGenreRepository;
      let categoryRepository: ICategoryRepository;

      beforeEach(async () => {
        genreRepository = app.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );

        categoryRepository = app.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected, relations }) => {
          const category = Category.fake().aCategory().build();

          await categoryRepository.bulkInsert([
            category,
            ...relations.categories,
          ]);

          const genreCreated = Genre.fake()
            .aGenre()
            .addCategoriesId(category.categoryID)
            .build();
          await genreRepository.insert(genreCreated);

          const res = await request(app.app.getHttpServer())
            .patch(`/genres/${genreCreated.genreId.id}`)
            .send(sendData)
            .expect(200);

          const keyInResponse = UpdateGenreFixture.keysInResponse;

          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

          const id = res.body.data.genreId;

          const genreUpdated = await genreRepository.findByID(new GenreId(id));

          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(genreUpdated!, relations.categories),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            genreId: serialized.genreId,
            createdAt: serialized.createdAt,
            ...expected,
          });
        },
      );
    });
  });
});

import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CreateGenreUseCase } from '@core/genre/application/use-cases/create-genre/create-genre.use-case';
import { DeleteGenreUseCase } from '@core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GetGenreUseCase } from '@core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';
import { UpdateGenreUseCase } from '@core/genre/application/use-cases/update-genre/update-genre.use-case';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { getConnectionToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.provider';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { GenresController } from '../genres.controller';
import { GenresModule } from '../genres.module';
import { GENRES_PROVIDERS } from '../genres.provider';
import {
  CreateGenreFixture,
  ListGenresFixture,
  UpdateGenreFixture,
} from '../testing/genre-fixture';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { GenreOutputMapper } from '@core/genre/application/use-cases/common/genre-output';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { GenreCollectionPresenter } from '../genres.presenter';
import { AuthModule } from 'src/nest-modules/auth-module/auth.module';

describe('GenresController Integration Tests', () => {
  let controller: GenresController;
  let genreRepository: IGenreRepository;
  let categoryRepository: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        AuthModule,
        GenresModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .compile();
    controller = module.get(GenresController);
    genreRepository = module.get(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepository = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createGenreUseCase']).toBeInstanceOf(CreateGenreUseCase);
    expect(controller['getGenreUseCase']).toBeInstanceOf(GetGenreUseCase);
    expect(controller['listGenresUseCase']).toBeInstanceOf(ListGenresUseCase);
    expect(controller['updateGenreUseCase']).toBeInstanceOf(UpdateGenreUseCase);
    expect(controller['deleteGenreUseCase']).toBeInstanceOf(DeleteGenreUseCase);
  });

  describe('should create a category', () => {
    const arrange = CreateGenreFixture.arrangeForSave();

    test.each(arrange)(
      'when body is $sendData',
      async ({ sendData, expected, relations }) => {
        await categoryRepository.bulkInsert(relations.categories);
        const presenter = await controller.create(sendData);
        const entity = await genreRepository.findByID(
          new Uuid(presenter.genreId),
        );

        expect(entity!.toJSON()).toStrictEqual({
          genreId: presenter.genreId,
          createdAt: presenter.createdAt,
          name: expected.name,
          categoriesId: expected.categoriesId,
          isActive: expected.isActive,
        });

        const expectedPresenter = GenresController.serialize(
          GenreOutputMapper.toOutput(entity!, relations.categories),
        );
        expectedPresenter.categories = expect.arrayContaining(
          expectedPresenter.categories,
        );
        expectedPresenter.categoriesId = expect.arrayContaining(
          expectedPresenter.categoriesId,
        );
        expect(presenter).toEqual(expectedPresenter);
      },
    );
  });

  describe('should update a category', () => {
    const arrange = UpdateGenreFixture.arrangeForSave();

    test.each(arrange)(
      'with request $sendData',
      async ({ entity: genre, sendData, expected, relations }) => {
        await categoryRepository.bulkInsert(relations.categories);
        await genreRepository.insert(genre);
        const presenter = await controller.update(genre.genreId.id, sendData);
        const genreUpdated = await genreRepository.findByID(
          new GenreId(presenter.genreId),
        );

        expect(genreUpdated!.toJSON()).toStrictEqual({
          genreId: presenter.genreId,
          createdAt: presenter.createdAt,
          name: expected.name ?? genre.name,
          categoriesId: expected.categoriesId
            ? expected.categoriesId
            : genre.categoriesId,
          isActive:
            expected.isActive === true || expected.isActive === false
              ? expected.isActive
              : genre.isActive,
        });
        const categoriesOfGenre = relations.categories.filter((c) =>
          genreUpdated!.categoriesId.has(c.categoryID.id),
        );

        const expectedPresenter = GenresController.serialize(
          GenreOutputMapper.toOutput(genreUpdated!, categoriesOfGenre),
        );
        expectedPresenter.categories = expect.arrayContaining(
          expectedPresenter.categories,
        );
        expectedPresenter.categoriesId = expect.arrayContaining(
          expectedPresenter.categoriesId,
        );
        expect(presenter).toEqual(expectedPresenter);
      },
    );
  });

  it('should delete a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(genre);
    const response = await controller.remove(genre.genreId.id);
    expect(response).not.toBeDefined();
    await expect(genreRepository.findByID(genre.genreId)).resolves.toBeNull();
  });

  it('should get a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoriesId(category.categoryID)
      .build();
    await genreRepository.insert(genre);
    const presenter = await controller.findOne(genre.genreId.id);
    expect(presenter.genreId).toBe(genre.genreId.id);
    expect(presenter.name).toBe(genre.name);
    expect(presenter.categories).toEqual([
      {
        categoryId: category.categoryID.id,
        name: category.name,
        createdAt: category.createdAt,
      },
    ]);
    expect(presenter.categoriesId).toEqual(
      expect.arrayContaining(Array.from(genre.categoriesId.keys())),
    );
    expect(presenter.createdAt).toStrictEqual(genre.createdAt);
  });

  describe('search method', () => {
    describe('should returns categories using query empty ordered by createdAt', () => {
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await categoryRepository.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);
          const { entities, ...paginationProps } = expected;
          const expectedPresenter = new GenreCollectionPresenter({
            items: entities.map((e) => ({
              ...e.toJSON(),
              genreId: e.genreId.id,
              categoriesId: expect.arrayContaining(
                Array.from(e.categoriesId.keys()),
              ),
              categories: Array.from(e.categoriesId.keys()).map((id) => ({
                categoryId: relations.categories.get(id)!.categoryID.id,
                name: relations.categories.get(id)!.name,
                createdAt: relations.categories.get(id)!.createdAt,
              })),
            })),
            ...paginationProps.meta,
          });
          presenter.data = presenter.data.map((item) => ({
            ...item,
            categories: expect.arrayContaining(item.categories),
          }));
          expect(presenter).toEqual(expectedPresenter);
        },
      );
    });

    describe('should returns output using pagination, sort and filter', () => {
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeUnsorted();

      beforeEach(async () => {
        await categoryRepository.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $label',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);
          const { entities, ...paginationProps } = expected;
          const expectedPresenter = new GenreCollectionPresenter({
            items: entities.map((e) => ({
              ...e.toJSON(),
              genreId: e.genreId.id,
              categoriesId: expect.arrayContaining(
                Array.from(e.categoriesId.keys()),
              ),
              categories: Array.from(e.categoriesId.keys()).map((id) => ({
                categoryId: relations.categories.get(id)!.categoryID.id,
                name: relations.categories.get(id)!.name,
                createdAt: relations.categories.get(id)!.createdAt,
              })),
            })),
            ...paginationProps.meta,
          });
          presenter.data = presenter.data.map((item) => ({
            ...item,
            categories: expect.arrayContaining(item.categories),
          }));
          expect(presenter).toEqual(expectedPresenter);
        },
      );
    });
  });
});

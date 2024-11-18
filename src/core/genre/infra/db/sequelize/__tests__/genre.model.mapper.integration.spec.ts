import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { GenreCategoryModel, GenreModel } from '../genre.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreModelMapper } from '../genre.model.mapper';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';

describe('GenreModelMapper Integration Tests', () => {
  let categoryRepository: ICategoryRepository;

  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });

  beforeEach(() => {
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
  });

  it('should throw error when genre is invalid', async () => {
    const arrange = [
      {
        makeModel: () => {
          // @ts-expect-error - Testing invalid data
          return GenreModel.build({
            genreId: '9366b1b4-0b9b-4b3b-8b1b-3b3b4b3b3b3b',
            name: 't'.repeat(256),
            categoriesId: [],
          });
        },
        expectedErrors: [
          {
            categoriesId: ['categoriesId should not be empty'],
          },
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ],
      },
    ];

    for (const item of arrange) {
      try {
        GenreModelMapper.toEntity(item.makeModel());
        fail('the genre is invalid, but it needs throw a LoadEntityError');
      } catch (e) {
        expect(e).toBeInstanceOf(LoadEntityError);
        expect(e.error).toMatchObject(item.expectedErrors);
      }
    }
  });

  it('should convert a genre model to genre entity', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepository.bulkInsert([category1, category2]);

    const createdAt = new Date();

    const model = await GenreModel.create(
      {
        genreId: '9366b1b4-0b9b-4b3b-8b1b-3b3b4b3b3b3b',
        name: 'Action',
        categoriesId: [
          GenreCategoryModel.build({
            genreId: '9366b1b4-0b9b-4b3b-8b1b-3b3b4b3b3b3b',
            categoryId: category1.categoryID.id,
          }),
          GenreCategoryModel.build({
            genreId: '9366b1b4-0b9b-4b3b-8b1b-3b3b4b3b3b3b',
            categoryId: category2.categoryID.id,
          }),
        ],
        isActive: true,
        createdAt,
      },
      { include: ['categoriesId'] },
    );

    const entity = GenreModelMapper.toEntity(model);

    expect(entity.toJSON()).toEqual(
      new Genre({
        genreId: new GenreId('9366b1b4-0b9b-4b3b-8b1b-3b3b4b3b3b3b'),
        name: 'Action',
        categoriesId: new Map([
          [category1.categoryID.id, category1.categoryID],
          [category2.categoryID.id, category2.categoryID],
        ]),
        isActive: true,
        createdAt,
      }).toJSON(),
    );
  });
});

import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { GenreCategoryModel, GenreModel } from '../genre.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { DataType } from 'sequelize-typescript';
import { Category } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';

describe('GenreCategoryModel Integration Tests', () => {
  setupSequelize({ models: [GenreModel, CategoryModel, GenreCategoryModel] });

  test('table name', async () => {
    expect(GenreCategoryModel.tableName).toBe('genres_categories');
  });

  test('mapping props', async () => {
    const attibutesMap = GenreCategoryModel.getAttributes();
    const attributes = Object.keys(GenreCategoryModel.getAttributes());

    expect(attributes).toStrictEqual(['genreId', 'categoryId']);

    const genreIdAttr = attibutesMap.genreId;
    expect(genreIdAttr).toMatchObject({
      field: 'genre_id',
      fieldName: 'genreId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'genres',
        key: 'genre_id',
      },
      unique: 'genres_categories_genreId_categoryId_unique',
    });

    const categoryIdAttr = attibutesMap.categoryId;
    expect(categoryIdAttr).toMatchObject({
      field: 'category_id',
      fieldName: 'categoryId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'categories',
        key: 'category_id',
      },
      unique: 'genres_categories_genreId_categoryId_unique',
    });
  });
});

describe('GenreModel Integration Tests', () => {
  setupSequelize({ models: [GenreModel, CategoryModel, GenreCategoryModel] });

  test('table name', async () => {
    expect(GenreModel.tableName).toBe('genres');
  });

  test('mapping props', async () => {
    const attibutesMap = GenreModel.getAttributes();
    const attributes = Object.keys(GenreModel.getAttributes());

    expect(attributes).toStrictEqual([
      'genreId',
      'name',
      'isActive',
      'createdAt',
    ]);

    const genreIdAttr = attibutesMap.genreId;
    expect(genreIdAttr).toMatchObject({
      field: 'genre_id',
      fieldName: 'genreId',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameAttr = attibutesMap.name;
    expect(nameAttr).toMatchObject({
      fieldName: 'name',
      type: DataType.STRING(),
    });

    const isActiveAttr = attibutesMap.isActive;
    expect(isActiveAttr).toMatchObject({
      field: 'is_active',
      fieldName: 'isActive',
      type: DataType.BOOLEAN(),
    });

    const createdAtAttr = attibutesMap.createdAt;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'createdAt',
      type: DataType.DATE(3),
    });
  });

  test('associations', async () => {
    const associationsMap = GenreModel.associations;
    const associations = Object.keys(associationsMap);

    expect(associations).toStrictEqual(['categoriesId', 'categories']);

    const categoriesIdAssoc = associationsMap.categoriesId;
    expect(categoriesIdAssoc).toMatchObject({
      associationType: 'HasMany',
      source: GenreModel,
      target: GenreCategoryModel,
      options: {
        foreignKey: { name: 'genreId' },
        as: 'categoriesId',
      },
    });

    const categoriesAssoc = associationsMap.categories;
    expect(categoriesAssoc).toMatchObject({
      associationType: 'BelongsToMany',
      source: GenreModel,
      target: CategoryModel,
      options: {
        through: { model: GenreCategoryModel },
        foreignKey: { name: 'genreId' },
        otherKey: { name: 'categoryId' },
        as: 'categories',
      },
    });
  });

  test('create and associate separate entities', async () => {
    const categories = Category.fake().theCategories(3).build();
    const categoryRepository = new CategorySequelizeRepository(CategoryModel);
    await categoryRepository.bulkInsert(categories);

    const genre = {
      genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
      name: 'test',
      isActive: true,
      createdAt: new Date(),
    };

    const genreModel = await GenreModel.create(genre);

    await genreModel.$add('categories', [
      categories[0].categoryID.id,
      categories[1].categoryID.id,
      categories[2].categoryID.id,
    ]);

    const genreCategories = await GenreModel.findByPk(genreModel.genreId, {
      include: [
        {
          model: CategoryModel,
          attributes: ['categoryID'],
        },
      ],
    });

    expect(genreCategories).toMatchObject(genre);
    expect(genreCategories!.categories).toHaveLength(3);

    expect(genreCategories!.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryID: categories[0].categoryID.id,
        }),
        expect.objectContaining({
          categoryID: categories[1].categoryID.id,
        }),
        expect.objectContaining({
          categoryID: categories[2].categoryID.id,
        }),
      ]),
    );

    const genreCategoriesId = await GenreModel.findByPk(genreModel.genreId, {
      include: ['categoriesId'],
    });

    expect(genreCategoriesId!.categoriesId).toHaveLength(3);

    expect(genreCategoriesId!.categoriesId).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          genreId: genreModel.genreId,
          categoryId: categories[0].categoryID.id,
        }),
        expect.objectContaining({
          genreId: genreModel.genreId,
          categoryId: categories[1].categoryID.id,
        }),
        expect.objectContaining({
          genreId: genreModel.genreId,
          categoryId: categories[2].categoryID.id,
        }),
      ]),
    );
  });
});

import { DataType } from 'sequelize-typescript';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize-helper';
import { CategoryModel } from '../category.model';

describe('CategoryModel Integration Tests', () => {
  setupSequelize({ models: [CategoryModel] });
  test('mapping props', async () => {
    const attibutesMap = CategoryModel.getAttributes();
    const attributes = Object.keys(CategoryModel.getAttributes());

    expect(attributes).toStrictEqual([
      'categoryID',
      'name',
      'description',
      'isActive',
      'createdAt',
    ]);

    const categoryIdAttr = attibutesMap.categoryID;
    expect(categoryIdAttr).toMatchObject({
      field: 'category_id',
      fieldName: 'categoryID',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameAttr = attibutesMap.name;
    expect(nameAttr).toMatchObject({
      field: 'name',
      fieldName: 'name',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const descriptionAttr = attibutesMap.description;
    expect(descriptionAttr).toMatchObject({
      field: 'description',
      fieldName: 'description',
      allowNull: true,
      type: DataType.TEXT(),
    });

    const isActiveAttr = attibutesMap.isActive;
    expect(isActiveAttr).toMatchObject({
      field: 'is_active',
      fieldName: 'isActive',
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    const createdAtAttr = attibutesMap.createdAt;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'createdAt',
      allowNull: false,
      type: DataType.DATE(3),
    });
  });

  test('create', async () => {
    const arrange = {
      categoryID: 'dc611201-32b5-4ef4-93b3-83fb1932149a',
      name: 'Movie',
      description: 'All about movies',
      isActive: true,
      createdAt: new Date(),
    };

    const category = await CategoryModel.create(arrange);

    expect(category.toJSON()).toStrictEqual(arrange);
  });
});

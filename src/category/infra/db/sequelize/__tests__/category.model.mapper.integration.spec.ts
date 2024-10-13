import { Sequelize } from 'sequelize-typescript';
import { CategoryModel } from '../category.model';
import { CategoryModelMapper } from '../category.model.mapper';
import { EntityValidationError } from '../../../../../shared/domain/validators/validation.error';
import { Category } from '../../../../domain/category.entity';
import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize-helper';

describe('CategoryModelMapper Integration Test', () => {
  setupSequelize({ models: [CategoryModel] });

  it('should trhow error when category is invalid', () => {
    const model = CategoryModel.build({
      categoryID: '123e4567-e89b-12d3-a456-426614174000',
    });

    try {
      CategoryModelMapper.toEntity(model);
      fail(
        'The category is valid, but it need to throw an EntityValidationError'
      );
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);
      expect((e as EntityValidationError).error).toMatchObject({
        name: [
          'name should not be empty',
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });
    }
  });

  it('should convert a category model to entity', () => {
    const createdAt = new Date();

    const model = CategoryModel.build({
      categoryID: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Category 1',
      description: 'Description of category 1',
      isActive: true,
      createdAt,
    });

    const entity = CategoryModelMapper.toEntity(model);

    expect(entity.toJSON()).toStrictEqual(
      new Category({
        categoryID: new Uuid('123e4567-e89b-12d3-a456-426614174000'),
        name: 'Category 1',
        description: 'Description of category 1',
        isActive: true,
        createdAt,
      }).toJSON()
    );
  });

  it('should conver a category entity to model', () => {
    const createdAt = new Date();

    const entity = new Category({
      categoryID: new Uuid('123e4567-e89b-12d3-a456-426614174000'),
      name: 'Category 1',
      description: 'Description of category 1',
      isActive: true,
      createdAt,
    });

    const model = CategoryModelMapper.toModel(entity);

    expect(model.toJSON()).toStrictEqual({
      categoryID: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Category 1',
      description: 'Description of category 1',
      isActive: true,
      createdAt,
    });
  });
});

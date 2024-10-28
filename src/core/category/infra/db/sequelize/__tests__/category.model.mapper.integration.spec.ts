import { EntityValidationError } from '../../../../../shared/domain/validators/validation.error';
import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize-helper';
import { Category } from '../../../../domain/category.entity';
import { CategoryModel } from '../category.model';
import { CategoryModelMapper } from '../category.model.mapper';

describe('CategoryModelMapper Integration Test', () => {
  setupSequelize({ models: [CategoryModel] });

  it('should trhow error when category is invalid', () => {
    expect.assertions(2);
    const model = CategoryModel.build({
      categoryID: '123e4567-e89b-12d3-a456-426614174000',
      name: 'a'.repeat(256),
    });

    try {
      CategoryModelMapper.toEntity(model);
      fail(
        'The category is valid, but it need to throw an EntityValidationError'
      );
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);
      expect((e as EntityValidationError).error).toMatchObject([
        { name: ['name must be shorter than or equal to 255 characters'] },
      ]);
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

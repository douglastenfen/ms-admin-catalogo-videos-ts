import { Category } from '../../../domain/category.aggregate';
import { CategoryOutputMapper } from './category-output';

describe('CategoryOutput Unit Test', () => {
  it('should convert a category in an output', () => {
    const aggregate = Category.create({
      name: 'Movie',
      description: 'Category for movies',
      isActive: true,
    });

    const spyToJSON = jest.spyOn(aggregate, 'toJSON');

    const output = CategoryOutputMapper.toOutput(aggregate);

    expect(spyToJSON).toHaveBeenCalled();

    expect(output).toStrictEqual({
      categoryID: aggregate.categoryID.id,
      name: 'Movie',
      description: 'Category for movies',
      isActive: true,
      createdAt: aggregate.createdAt,
    });
  });
});

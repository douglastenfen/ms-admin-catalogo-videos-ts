import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreSearchParams } from '../genre.repository';

describe('GenreRepository Unit Tests', () => {
  describe('create', () => {
    it('should create a new instance of GenreSearchParams with default values', () => {
      const searchParams = GenreSearchParams.create();

      expect(searchParams).toBeInstanceOf(GenreSearchParams);
      expect(searchParams.filter).toBeNull();
    });

    it('should create a new instance of GenreSearchParams with filter values', () => {
      const searchParams = GenreSearchParams.create({
        filter: {
          name: 'Test',
          categoriesId: ['123e4567-e89b-12d3-a456-426614174000'],
        },
      });

      expect(searchParams).toBeInstanceOf(GenreSearchParams);
      expect(searchParams.filter).toEqual({
        name: 'Test',
        categoriesId: [new CategoryId('123e4567-e89b-12d3-a456-426614174000')],
      });
    });
  });
});

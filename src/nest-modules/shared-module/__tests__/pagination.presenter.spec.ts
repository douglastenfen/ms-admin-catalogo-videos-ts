import { instanceToPlain } from 'class-transformer';
import { PaginationPresenter } from '../pagination.presenter';

describe('PaginationPresenter Unit Tests', () => {
  describe('constructor', () => {
    it('should set values', () => {
      const presenter = new PaginationPresenter({
        currentPage: 1,
        perPage: 2,
        lastPage: 3,
        total: 4,
      });

      expect(presenter.currentPage).toBe(1);
      expect(presenter.perPage).toBe(2);
      expect(presenter.lastPage).toBe(3);
      expect(presenter.total).toBe(4);
    });

    it('should set string to number values', () => {
      const presenter = new PaginationPresenter({
        currentPage: '1' as any,
        perPage: '2' as any,
        lastPage: '3' as any,
        total: '4' as any,
      });

      expect(presenter.currentPage).toBe('1');
      expect(presenter.perPage).toBe('2');
      expect(presenter.lastPage).toBe('3');
      expect(presenter.total).toBe('4');
    });

    it('should presenter data', () => {
      let presenter = new PaginationPresenter({
        currentPage: 1,
        perPage: 2,
        lastPage: 3,
        total: 4,
      });

      expect(instanceToPlain(presenter)).toStrictEqual({
        currentPage: 1,
        perPage: 2,
        lastPage: 3,
        total: 4,
      });

      presenter = new PaginationPresenter({
        currentPage: '1' as any,
        perPage: '2' as any,
        lastPage: '3' as any,
        total: '4' as any,
      });

      expect(instanceToPlain(presenter)).toStrictEqual({
        currentPage: 1,
        perPage: 2,
        lastPage: 3,
        total: 4,
      });
    });
  });
});

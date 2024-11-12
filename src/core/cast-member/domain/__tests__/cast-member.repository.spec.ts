import { SearchValidationError } from '@core/shared/domain/validators/validation.error';
import { CastMemberTypes } from '../cast-member-type.vo';
import { CastMemberSearchParams } from '../cast-member.repository';

describe('CastMemberRepository Unit Tests', () => {
  describe('create', () => {
    it('should create a new instance of CastMemberSearchParams with default values', () => {
      const searchParams = CastMemberSearchParams.create();

      expect(searchParams).toBeInstanceOf(CastMemberSearchParams);
      expect(searchParams.filter).toBeNull();
    });

    it('should create a new instance of CastMemberSearchParams with filter values', () => {
      const searchParams = CastMemberSearchParams.create({
        filter: {
          name: 'Test',
          type: CastMemberTypes.ACTOR,
        },
      });

      expect(searchParams).toBeInstanceOf(CastMemberSearchParams);
      expect(searchParams.filter.name).toBe('Test');
      expect(searchParams.filter.type.type).toBe(CastMemberTypes.ACTOR);
    });

    it('should throw an error when an invalid type is passed', () => {
      expect(() =>
        CastMemberSearchParams.create({
          filter: {
            name: 'Test',
            type: 'invalid' as any,
          },
        }),
      ).toThrow(SearchValidationError);
    });
  });
});

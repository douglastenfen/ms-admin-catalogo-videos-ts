import { Uuid, InvalidUUIDError } from '../uuid.vo';
import { validate as uuidValidate } from 'uuid';

describe('UUID Value Object Unit Tests', () => {
  const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate');

  test('should throw error when uuid is invalid', () => {
    expect(() => new Uuid('invalid-uuid')).toThrow(InvalidUUIDError);

    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  test('should create a new uuid', () => {
    const uuid = new Uuid();

    expect(uuid.id).toBeDefined();

    expect(uuid).toBeInstanceOf(Uuid);

    expect(uuidValidate(uuid.id)).toBe(true);

    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  test('should accept a valid uuid', () => {
    const uuid = new Uuid('f47ac10b-58cc-4372-a567-0e02b2c3d479');

    expect(uuid.id).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');

    expect(validateSpy).toHaveBeenCalledTimes(1);
  });
});

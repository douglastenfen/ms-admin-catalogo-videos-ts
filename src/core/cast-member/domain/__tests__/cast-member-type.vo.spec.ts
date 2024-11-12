import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from '../cast-member-type.vo';

describe('CastMemberType Unit Tests', () => {
  it('should return error when type is invalid', () => {
    const validateSpy = jest.spyOn(CastMemberType.prototype, 'validate' as any);

    const [vo, error] = CastMemberType.create('1' as any);

    expect(vo).toBeNull();
    expect(error).toEqual(new InvalidCastMemberTypeError('1'));
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  it('should create a director type', () => {
    const [vo1, error] = CastMemberType.create(
      CastMemberTypes.DIRECTOR,
    ).asArray();

    expect(vo1).toBeInstanceOf(CastMemberType);
    expect(vo1.type).toBe(CastMemberTypes.DIRECTOR);
    expect(error).toBeNull();

    const vo2 = CastMemberType.createDirector();

    expect(vo2).toBeInstanceOf(CastMemberType);
    expect(vo2.type).toBe(CastMemberTypes.DIRECTOR);
    expect(error).toBeNull();
  });

  it('should create an actor type', () => {
    const [vo1, error] = CastMemberType.create(CastMemberTypes.ACTOR).asArray();

    expect(vo1).toBeInstanceOf(CastMemberType);
    expect(vo1.type).toBe(CastMemberTypes.ACTOR);
    expect(error).toBeNull();

    const vo2 = CastMemberType.createActor();

    expect(vo2).toBeInstanceOf(CastMemberType);
    expect(vo2.type).toBe(CastMemberTypes.ACTOR);
    expect(error).toBeNull();
  });
});

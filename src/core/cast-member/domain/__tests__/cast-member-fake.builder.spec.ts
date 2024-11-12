import { Chance } from 'chance';
import { CastMemberFakeBuilder } from '../cast-member-fake.builder';
import { CastMemberId } from '../cast-member.aggregate';
import { CastMemberType, CastMemberTypes } from '../cast-member-type.vo';
import { type } from 'os';

describe('CastMemberFakeBuilder Unit Tests', () => {
  describe('castMemberId prop', () => {
    const faker = CastMemberFakeBuilder.anActor();

    it('should throw error when any with methods has called', () => {
      expect(() => faker.castMemberId).toThrow(
        new Error(
          `Property castMemberId not have a factory, use 'with' methods`,
        ),
      );
    });

    it('should be undefined', () => {
      expect(faker['_castMemberId']).toBeUndefined();
    });

    test('withCastMemberId', () => {
      const castMemberId = new CastMemberId();

      const $this = faker.withCastMemberID(castMemberId);

      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect($this['_castMemberId']).toBe(castMemberId);

      faker.withCastMemberID(() => castMemberId);

      //@ts-expect-error _castMemberId is a callable
      expect(faker['_castMemberId']()).toBe(castMemberId);

      expect(faker.castMemberId).toBe(castMemberId);
    });

    test('withCastMemberId using factory', () => {
      let mockFactory = jest.fn(() => new CastMemberId());

      faker.withCastMemberID(mockFactory);
      faker.build();

      expect(mockFactory).toHaveBeenCalledTimes(1);

      const castMemberId = new CastMemberId();

      mockFactory = jest.fn(() => castMemberId);

      const fakerMany = CastMemberFakeBuilder.theActors(2);

      fakerMany.withCastMemberID(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);

      expect(fakerMany.build()[0].castMemberId).toBe(castMemberId);
      expect(fakerMany.build()[1].castMemberId).toBe(castMemberId);
    });
  });

  describe('name prop', () => {
    const faker = CastMemberFakeBuilder.anActor();

    it('should be a function', () => {
      expect(faker['_name']).toBeInstanceOf(Function);
    });

    it('should call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');

      faker['chance'] = chance;

      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withName', () => {
      const $this = faker.withName('John Doe');

      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect($this['_name']).toBe('John Doe');

      faker.withName(() => 'John Doe');

      //@ts-expect-error _name is a callable
      expect(faker['_name']()).toBe('John Doe');

      expect(faker.name).toBe('John Doe');
    });

    it('should pass index to name factory', () => {
      faker.withName((index) => `John Doe ${index}`);

      const castMember = faker.build();
      expect(castMember.name).toBe('John Doe 0');

      const fakerMany = CastMemberFakeBuilder.theActors(2);

      fakerMany.withName((index) => `John Doe ${index}`);

      const castMembers = fakerMany.build();
      expect(castMembers[0].name).toBe('John Doe 0');
      expect(castMembers[1].name).toBe('John Doe 1');
    });

    test('invalid too long name', () => {
      const $this = faker.withInvalidTooLongName();

      expect($this).toBeInstanceOf(CastMemberFakeBuilder);

      expect(faker.name).toHaveLength(256);

      faker.withInvalidTooLongName();

      expect(faker.name.length).toBe(256);
    });
  });

  describe('type prop', () => {
    const faker = CastMemberFakeBuilder.anActor();

    it('should be a CastMemberType', () => {
      expect(faker['_type']).toBeInstanceOf(CastMemberType);
    });

    test('withType', () => {
      const type = CastMemberType.createActor();

      const $this = faker.withType(type);

      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect($this['_type']).toBe(type);

      faker.withType(() => type);

      //@ts-expect-error _type is a callable
      expect(faker['_type']()).toBe(type);

      expect(faker.type).toBe(type);
    });
  });

  describe('createdAt prop', () => {
    const faker = CastMemberFakeBuilder.anActor();

    it('should throw error when any with methods has called', () => {
      const fakeCastMember = CastMemberFakeBuilder.anActor();

      expect(() => fakeCastMember.createdAt).toThrow(
        new Error(`Property createdAt not have a factory, use 'with' methods`),
      );
    });

    it('should be undefined', () => {
      expect(faker['_createdAt']).toBeUndefined();
    });

    test('with createdAt', () => {
      const createdAt = new Date();

      const $this = faker.withCreatedAt(createdAt);

      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect($this['_createdAt']).toBe(createdAt);

      faker.withCreatedAt(() => createdAt);

      //@ts-expect-error _createdAt is a callable
      expect(faker['_createdAt']()).toBe(createdAt);
      expect(faker.createdAt).toBe(createdAt);
    });

    it('should pass index to createdAt factory', () => {
      const date = new Date();

      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));

      const castMember = faker.build();
      expect(castMember.createdAt).toEqual(new Date(date.getTime() + 2));

      const fakerMany = CastMemberFakeBuilder.theActors(2);

      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));

      const castMembers = fakerMany.build();
      expect(castMembers[0].createdAt).toEqual(new Date(date.getTime() + 2));
      expect(castMembers[1].createdAt).toEqual(new Date(date.getTime() + 3));
    });
  });

  it('should create a cast member', () => {
    const faker = CastMemberFakeBuilder.anActor();

    let castMember = faker.build();

    expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
    expect(typeof castMember.name).toBe('string');
    expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
    expect(castMember.createdAt).toBeInstanceOf(Date);

    const castMemberId = new CastMemberId();
    const createdAt = new Date();

    castMember = faker
      .withCastMemberID(castMemberId)
      .withName('John Doe')
      .withType(CastMemberType.createDirector())
      .withCreatedAt(createdAt)
      .build();

    expect(castMember.castMemberId.id).toBe(castMemberId.id);
    expect(castMember.name).toBe('John Doe');
    expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
    expect(castMember.createdAt).toBe(createdAt);
  });

  it('should create many cast members', () => {
    const faker = CastMemberFakeBuilder.theCastMembers(2);

    let castMembers = faker.build();

    castMembers.forEach((castMember) => {
      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(typeof castMember.name).toBe('string');
      expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
      expect(castMember.createdAt).toBeInstanceOf(Date);
    });

    const castMemberId = new CastMemberId();
    const createdAt = new Date();

    castMembers = faker
      .withCastMemberID(castMemberId)
      .withName('John Doe')
      .withType(CastMemberType.createDirector())
      .withCreatedAt(createdAt)
      .build();

    castMembers.forEach((castMember) => {
      expect(castMember.castMemberId.id).toBe(castMemberId.id);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
      expect(castMember.createdAt).toBe(createdAt);
    });
  });
});

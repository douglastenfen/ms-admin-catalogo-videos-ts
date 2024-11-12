import { CastMemberType } from '../cast-member-type.vo';
import { CastMember, CastMemberId } from '../cast-member.aggregate';

describe('CastMember Unit Tests', () => {
  beforeEach(() => {
    CastMember.prototype.validate = jest
      .fn()
      .mockImplementation(CastMember.prototype.validate);
  });

  describe('constructor', () => {
    it('should create a cast member', () => {
      const director = CastMemberType.createDirector();

      let castMember = new CastMember({
        name: 'Director',
        type: director,
      });

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('Director');
      expect(castMember.type).toBe(director);
      expect(castMember.createdAt).toBeInstanceOf(Date);

      const createdAt = new Date();

      castMember = new CastMember({
        castMemberId: new CastMemberId(),
        name: 'Director',
        type: director,
        createdAt,
      });

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('Director');
      expect(castMember.type).toBe(director);
      expect(castMember.createdAt).toBe(createdAt);
    });
  });

  describe('castMemberId', () => {
    const actor = CastMemberType.createActor();

    const arrange = [
      { name: 'Actor', type: actor },
      { name: 'Actor', type: actor, castMemberId: null },
      { name: 'Actor', type: actor, castMemberId: undefined },
      { name: 'Actor', type: actor, castMemberId: new CastMemberId() },
    ];

    test.each(arrange)('when props are %p', (item) => {
      const castMember = new CastMember(item);

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
    });
  });

  describe('create command', () => {
    it('should create a cast member', () => {
      const actor = CastMemberType.createActor();

      const castMember = CastMember.create({
        name: 'Actor',
        type: actor,
      });

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('Actor');
      expect(castMember.type).toBe(actor);
      expect(castMember.createdAt).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(false);
    });
  });

  it('should change name', () => {
    const actor = CastMemberType.createActor();

    const castMember = CastMember.create({
      name: 'Actor',
      type: actor,
    });

    castMember.changeName('New Actor');

    expect(castMember.name).toBe('New Actor');
    expect(CastMember.prototype.validate).toHaveBeenCalledTimes(2);
    expect(castMember.notification.hasErrors()).toBe(false);
  });

  it('should change type', () => {
    const actor = CastMemberType.createActor();
    const director = CastMemberType.createDirector();

    const castMember = CastMember.create({
      name: 'Actor',
      type: actor,
    });

    castMember.changeType(director);

    expect(castMember.type).toBe(director);
    expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
    expect(castMember.notification.hasErrors()).toBe(false);
  });
});

describe('CastMember Validation', () => {
  describe('create command', () => {
    it('should throw an error when name is invalid', () => {
      const castMember = CastMember.create({ name: 'a'.repeat(256) } as any);

      expect(castMember.notification.hasErrors()).toBe(true);
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('change name method', () => {
    it('should throw an error when name is invalid', () => {
      const actor = CastMemberType.createActor();

      const castMember = CastMember.create({
        name: 'Actor',
        type: actor,
      });

      castMember.changeName('a'.repeat(256));

      expect(castMember.notification.hasErrors()).toBe(true);
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});

import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CastMembersIdExistsInDatabaseValidator } from './cast-members-id-exists-in-database.validator';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('CastMembersIdExistsInDatabaseValidator Unit Tests', () => {
  let castMemberRepository: CastMemberInMemoryRepository;
  let validator: CastMembersIdExistsInDatabaseValidator;

  beforeEach(() => {
    castMemberRepository = new CastMemberInMemoryRepository();
    validator = new CastMembersIdExistsInDatabaseValidator(
      castMemberRepository,
    );
  });

  it('should return many not found errors when cast members ID do not exist in database', async () => {
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();

    const spyExistsById = jest.spyOn(castMemberRepository, 'existsById');

    let [castMembersId, errorsCastMembersId] = await validator.validate([
      castMemberId1.id,
      castMemberId2.id,
    ]);

    expect(castMembersId).toEqual(null);

    expect(errorsCastMembersId).toStrictEqual([
      new NotFoundError(castMemberId1.id, CastMember),
      new NotFoundError(castMemberId2.id, CastMember),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const castMember1 = CastMember.fake().anActor().build();
    await castMemberRepository.insert(castMember1);

    [castMembersId, errorsCastMembersId] = await validator.validate([
      castMember1.castMemberId.id,
      castMemberId2.id,
    ]);

    expect(castMembersId).toEqual(null);

    expect(errorsCastMembersId).toStrictEqual([
      new NotFoundError(castMemberId2.id, CastMember),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of cast members ID', async () => {
    const castMember1 = CastMember.fake().anActor().build();
    const castMember2 = CastMember.fake().anActor().build();

    await castMemberRepository.bulkInsert([castMember1, castMember2]);

    const [castMembersId, errorsCastMembersId] = await validator.validate([
      castMember1.castMemberId.id,
      castMember2.castMemberId.id,
    ]);

    expect(castMembersId).toHaveLength(2);

    expect(errorsCastMembersId).toStrictEqual(null);

    expect(castMembersId[0]).toBeValueObject(castMember1.castMemberId);
    expect(castMembersId[1]).toBeValueObject(castMember2.castMemberId);
  });
});

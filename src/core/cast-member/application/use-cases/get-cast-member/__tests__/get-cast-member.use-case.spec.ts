import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { InvalidUUIDError } from '@core/shared/domain/value-objects/uuid.vo';
import { GetCastMemberUseCase } from '../get-cast-member.use-case';

describe('GetCastMemberUseCase Unit Test', () => {
  let useCase: GetCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new GetCastMemberUseCase(repository);
  });

  it('should throw an error if cast member does not exist', async () => {
    await expect(() =>
      useCase.execute({ castMemberId: 'fake-id' }),
    ).rejects.toThrow(new InvalidUUIDError());

    const castMemberId = new CastMemberId();

    await expect(() =>
      useCase.execute({ castMemberId: castMemberId.id }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should return a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    repository.items = [castMember];

    const spyFindByID = jest.spyOn(repository, 'findByID');

    const result = await useCase.execute({
      castMemberId: castMember.castMemberId.id,
    });

    expect(spyFindByID).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({
      castMemberId: castMember.castMemberId.id,
      name: castMember.name,
      type: CastMemberTypes.ACTOR,
      createdAt: castMember.createdAt,
    });
  });
});

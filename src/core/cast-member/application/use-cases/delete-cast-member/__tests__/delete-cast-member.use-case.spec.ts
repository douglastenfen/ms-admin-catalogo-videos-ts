import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { DeleteCastMemberUseCase } from '../delete-cast-member.use-case';

describe('DeleteCastMemberUseCase Unit Test', () => {
  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new DeleteCastMemberUseCase(repository);
  });

  it('should throw an error if cast member does not exist', async () => {
    const castMemberId = new CastMemberId();

    await expect(() =>
      useCase.execute({ castMemberId: castMemberId.id }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should delete a cast member', async () => {
    const spyDelete = jest.spyOn(repository, 'delete');

    const castMember = CastMember.fake().anActor().build();

    repository.items = [castMember];

    await useCase.execute({ castMemberId: castMember.castMemberId.id });

    expect(spyDelete).toHaveBeenCalledTimes(1);
    expect(repository.items).toHaveLength(0);
  });
});

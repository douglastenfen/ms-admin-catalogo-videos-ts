import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { DeleteCastMemberUseCase } from '../delete-cast-member.use-case';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('DeleteCastMemberUseCase Integration Test', () => {
  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new DeleteCastMemberUseCase(repository);
  });

  it('should trhow an error if cast member does not exist', async () => {
    const castMemberId = new CastMemberId();

    await expect(() =>
      useCase.execute({ castMemberId: castMemberId.id }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    await repository.insert(castMember);

    await useCase.execute({ castMemberId: castMember.castMemberId.id });

    await expect(
      repository.findByID(castMember.castMemberId),
    ).resolves.toBeNull();
  });
});

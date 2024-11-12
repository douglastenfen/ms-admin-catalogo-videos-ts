import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { GetCastMemberUseCase } from '../get-cast-member.use-case';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

describe('GetCastMemberUseCase Integration Test', () => {
  let useCase: GetCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new GetCastMemberUseCase(repository);
  });

  it('should throw an error if cast member does not exist', async () => {
    const castMemberId = new CastMemberId();

    await expect(() =>
      useCase.execute({ castMemberId: castMemberId.id }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should return a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    repository.insert(castMember);

    const result = await useCase.execute({
      castMemberId: castMember.castMemberId.id,
    });

    expect(result).toStrictEqual({
      castMemberId: castMember.castMemberId.id,
      name: castMember.name,
      type: CastMemberTypes.ACTOR,
      createdAt: castMember.createdAt,
    });
  });
});

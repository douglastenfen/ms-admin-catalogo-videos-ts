import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';

describe('CreateCastMemberUseCase Integration Test', () => {
  let useCase: CreateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new CreateCastMemberUseCase(repository);
  });

  it('should create a cast member', async () => {
    let output = await useCase.execute({
      name: 'test',
      type: CastMemberTypes.ACTOR,
    });

    let entity = await repository.findByID(
      new CastMemberId(output.castMemberId),
    );

    expect(output).toStrictEqual({
      castMemberId: entity!.castMemberId.id,
      name: 'test',
      type: CastMemberTypes.ACTOR,
      createdAt: entity!.createdAt,
    });

    output = await useCase.execute({
      name: 'test',
      type: CastMemberTypes.DIRECTOR,
    });

    entity = await repository.findByID(new CastMemberId(output.castMemberId));

    expect(output).toStrictEqual({
      castMemberId: entity!.castMemberId.id,
      name: 'test',
      type: CastMemberTypes.DIRECTOR,
      createdAt: entity.createdAt,
    });
  });
});

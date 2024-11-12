import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { UpdateCastMemberInput } from '../update-cast-member.input';

describe('UpdateCastMemberUseCase Integration Test', () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('should throw an error if cast member does not exist', async () => {
    const castMemberId = new CastMemberId();

    await expect(() =>
      useCase.execute({ castMemberId: castMemberId.id, name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should update a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();

    repository.insert(castMember);

    let output = await useCase.execute({
      castMemberId: castMember.castMemberId.id,
      name: 'test',
    });

    expect(output).toStrictEqual({
      castMemberId: castMember.castMemberId.id,
      name: 'test',
      type: CastMemberTypes.ACTOR,
      createdAt: castMember.createdAt,
    });

    type Arrange = {
      input: {
        castMemberId: string;
        name?: string;
        type?: CastMemberTypes;
      };
      expected: {
        castMemberId: string;
        name: string;
        type: CastMemberTypes;
        createdAt: Date;
      };
    };

    const arrange: Arrange[] = [
      {
        input: {
          castMemberId: castMember.castMemberId.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          castMemberId: castMember.castMemberId.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
          createdAt: castMember.createdAt,
        },
      },
      {
        input: {
          castMemberId: castMember.castMemberId.id,
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          castMemberId: castMember.castMemberId.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
          createdAt: castMember.createdAt,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute({
        castMemberId: i.input.castMemberId,
        name: i.input.name,
        type: i.input.type,
      });

      const castMemberUpdated = await repository.findByID(
        new CastMemberId(i.input.castMemberId),
      );

      expect(output).toStrictEqual({
        castMemberId: i.expected.castMemberId,
        name: i.expected.name,
        type: i.expected.type,
        createdAt: i.expected.createdAt,
      });

      expect(castMemberUpdated!.toJSON()).toStrictEqual({
        castMemberId: castMemberUpdated!.castMemberId.id,
        name: i.expected.name,
        type: i.expected.type,
        createdAt: i.expected.createdAt,
      });
    }
  });
});

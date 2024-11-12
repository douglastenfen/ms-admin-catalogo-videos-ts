import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { UpdateCastMemberInput } from '../update-cast-member.input';

describe('UpdateCastMemberUseCase Unit Test', () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('should throw and error when cast member does not exist', async () => {
    const castMemberId = new CategoryId();

    await expect(() =>
      useCase.execute({ castMemberId: castMemberId.id, name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should update a cast member', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');

    const castMember = CastMember.fake().anActor().build();

    repository.items = [castMember];

    let output = await useCase.execute({
      castMemberId: castMember.castMemberId.id,
      name: 'test',
    });

    expect(spyUpdate).toHaveBeenCalledTimes(1);

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
      output = await useCase.execute(
        new UpdateCastMemberInput({
          castMemberId: i.input.castMemberId,
          ...('name' in i.input && { name: i.input.name }),
          ...('type' in i.input && { type: i.input.type }),
        }),
      );

      expect(output).toStrictEqual({
        castMemberId: i.expected.castMemberId,
        name: i.expected.name,
        type: i.expected.type,
        createdAt: i.expected.createdAt,
      });
    }
  });
});

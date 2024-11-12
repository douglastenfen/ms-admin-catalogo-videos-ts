import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

describe('CreateCastMemberUseCase Unit Test', () => {
  let useCase: CreateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new CreateCastMemberUseCase(repository);
  });

  it('should throw error when cast member is invalid', async () => {
    try {
      await useCase.execute({ name: 'test', type: 'invalid' as any });
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);

      expect(e.error).toStrictEqual([
        {
          type: ['Invalid cast member type: invalid'],
        },
      ]);
    }
  });

  it('should create a cast member', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');

    let output = await useCase.execute({
      name: 'test',
      type: CastMemberTypes.ACTOR,
    });

    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      castMemberId: repository.items[0].castMemberId.id,
      name: 'test',
      type: CastMemberTypes.ACTOR,
      createdAt: repository.items[0].createdAt,
    });

    output = await useCase.execute({
      name: 'test',
      type: CastMemberTypes.DIRECTOR,
    });

    expect(spyInsert).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      castMemberId: repository.items[1].castMemberId.id,
      name: 'test',
      type: CastMemberTypes.DIRECTOR,
      createdAt: repository.items[1].createdAt,
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CastMembersController } from '../cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from '../cast-members.provider';
import { CreateCastMemberOutput } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { CreateCastMemberDto } from '../dto/create-cast-member.dto';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from '../cast-members.presenter';
import { UpdateCastMemberOutput } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { GetCastMemberOutput } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersOutput } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { SortDirection } from '@core/shared/domain/repository/search-params';

describe('CastMembersController', () => {
  let controller: CastMembersController;

  beforeEach(async () => {
    controller = new CastMembersController();
  });

  it('should create a cast member', async () => {
    const output: CreateCastMemberOutput = {
      castMemberId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      type: CastMemberTypes.ACTOR,
      createdAt: new Date(),
    };

    const mockCreateUseCase = {
      execute: jest.fn().mockResolvedValue(output),
    };

    // @ts-ignore - We are mocking the use case
    controller['createCastMemberUseCase'] = mockCreateUseCase;

    const input: CreateCastMemberDto = {
      name: 'John Doe',
      type: CastMemberTypes.ACTOR,
    };

    const presenter = await controller.create(input);

    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should update a cast member', async () => {
    const castMemberId = '123e4567-e89b-12d3-a456-426614174000';

    const output: UpdateCastMemberOutput = {
      castMemberId,
      name: 'John Doe',
      type: CastMemberTypes.ACTOR,
      createdAt: new Date(),
    };

    const mockUpdateUseCase = {
      execute: jest.fn().mockResolvedValue(output),
    };

    // @ts-ignore - We are mocking the use case
    controller['updateCastMemberUseCase'] = mockUpdateUseCase;

    const input = {
      name: 'John Doe',
      type: CastMemberTypes.ACTOR,
    };

    const presenter = await controller.update(castMemberId, input);

    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
      castMemberId,
      ...input,
    });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should delete a cast member', async () => {
    const expectedOutput = undefined;

    const mockDeleteUseCase = {
      execute: jest.fn().mockResolvedValue(expectedOutput),
    };

    // @ts-ignore - We are mocking the use case
    controller['deleteCastMemberUseCase'] = mockDeleteUseCase;

    const castMemberId = '123e4567-e89b-12d3-a456-426614174000';

    expect(controller.remove(castMemberId)).toBeInstanceOf(Promise);

    const output = await controller.remove(castMemberId);

    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ castMemberId });
    expect(expectedOutput).toStrictEqual(output);
  });

  it('should get a cast member', async () => {
    const castMemberId = '123e4567-e89b-12d3-a456-426614174000';

    const output: GetCastMemberOutput = {
      castMemberId,
      name: 'John Doe',
      type: CastMemberTypes.ACTOR,
      createdAt: new Date(),
    };

    const mockGetUseCase = {
      execute: jest.fn().mockResolvedValue(output),
    };

    // @ts-ignore - We are mocking the use case
    controller['getCastMemberUseCase'] = mockGetUseCase;

    const presenter = await controller.findOne(castMemberId);

    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ castMemberId });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should list cast members', async () => {
    const output: ListCastMembersOutput = {
      items: [
        {
          castMemberId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          type: CastMemberTypes.ACTOR,
          createdAt: new Date(),
        },
      ],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    };

    const mockListUseCase = {
      execute: jest.fn().mockResolvedValue(output),
    };

    // @ts-ignore - We are mocking the use case
    controller['listCastMembersUseCase'] = mockListUseCase;

    const searchParams = {
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'desc' as SortDirection,
      filter: { name: 'test' },
    };

    const presenter = await controller.search(searchParams);

    expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toStrictEqual(new CastMemberCollectionPresenter(output));
  });
});

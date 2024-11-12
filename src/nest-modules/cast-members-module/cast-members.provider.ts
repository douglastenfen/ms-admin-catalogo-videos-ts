import { CreateCastMemberUseCase } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { GetCastMemberUseCase } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersUseCase } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { UpdateCastMemberUseCase } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { getModelToken } from '@nestjs/sequelize';

export const REPOSITORIES = {
  CAST_MEMBER_REPOSITORY: {
    provide: 'CastMemberRepository',
    useExisting: CastMemberSequelizeRepository,
  },
  CAST_MEMBER_IN_MEMORY_REPOSITORY: {
    provide: CastMemberInMemoryRepository,
    useClass: CastMemberInMemoryRepository,
  },
  CAST_MEMBER_SEQUELIZE_REPOSITORY: {
    provide: CastMemberSequelizeRepository,
    useFactory: (castMemberModel: typeof CastMemberModel) => {
      return new CastMemberSequelizeRepository(castMemberModel);
    },
    inject: [getModelToken(CastMemberModel)],
  },
};

export const USE_CASES = {
  CREATE_CAST_MEMBER_USE_CASE: {
    provide: CreateCastMemberUseCase,
    useFactory: (castMemberRepository: ICastMemberRepository) => {
      return new CreateCastMemberUseCase(castMemberRepository);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  GET_CAST_MEMBER_USE_CASE: {
    provide: GetCastMemberUseCase,
    useFactory: (castMemberRepository: ICastMemberRepository) => {
      return new GetCastMemberUseCase(castMemberRepository);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  LIST_CAST_MEMBERS_USE_CASE: {
    provide: ListCastMembersUseCase,
    useFactory: (castMemberRepository: ICastMemberRepository) => {
      return new ListCastMembersUseCase(castMemberRepository);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  UPDATE_CAST_MEMBER_USE_CASE: {
    provide: UpdateCastMemberUseCase,
    useFactory: (castMemberRepository: ICastMemberRepository) => {
      return new UpdateCastMemberUseCase(castMemberRepository);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  DELETE_CAST_MEMBER_USE_CASE: {
    provide: DeleteCastMemberUseCase,
    useFactory: (castMemberRepository: ICastMemberRepository) => {
      return new DeleteCastMemberUseCase(castMemberRepository);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
};

export const CAST_MEMBER_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};

import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CastMembersController } from './cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from './cast-members.provider';

@Module({
  imports: [SequelizeModule.forFeature([CastMemberModel])],
  controllers: [CastMembersController],
  providers: [
    ...Object.values(CAST_MEMBER_PROVIDERS.REPOSITORIES),
    ...Object.values(CAST_MEMBER_PROVIDERS.USE_CASES),
    ...Object.values(CAST_MEMBER_PROVIDERS.VALIDATIONS),
  ],
  exports: [
    CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    CAST_MEMBER_PROVIDERS.VALIDATIONS
      .CAST_MEMBERS_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
  ],
})
export class CastMembersModule {}

import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';

export type CastMemberOutput = {
  castMemberId: string;
  name: string;
  type: CastMemberTypes;
  createdAt: Date;
};

export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    const { castMemberId, ...otherProps } = entity.toJSON();

    return {
      castMemberId,
      ...otherProps,
    };
  }
}

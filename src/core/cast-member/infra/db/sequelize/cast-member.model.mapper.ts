import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberModel } from './cast-member.model';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';

export class CastMemberModelMapper {
  static toModel(entity: CastMember): CastMemberModel {
    return CastMemberModel.build({
      castMemberId: entity.castMemberId.id,
      name: entity.name,
      type: entity.type.type,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(model: CastMemberModel): CastMember {
    const { castMemberId, ...otherData } = model.toJSON();

    const [type, errorCastMemberType] = CastMemberType.create(
      otherData.type as any,
    ).asArray();

    const castMember = new CastMember({
      ...otherData,
      castMemberId: new CastMemberId(castMemberId),
      type,
    });

    castMember.validate();

    const notification = castMember.notification;

    if (errorCastMemberType) {
      notification.setError(errorCastMemberType.message, 'type');
    }

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return castMember;
  }
}

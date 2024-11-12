import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member-output';
import { CreateCastMemberInput } from './create-cast-member.input';

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const [type, errorCastMemberType] = CastMemberType.create(
      input.type,
    ).asArray();

    const entity = CastMember.create({
      ...input,
      type,
    });

    const notification = entity.notification;

    if (errorCastMemberType) {
      notification.setError(errorCastMemberType.message, 'type');
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.castMemberRepository.insert(entity);

    return CastMemberOutputMapper.toOutput(entity);
  }
}

export type CreateCastMemberOutput = CastMemberOutput;

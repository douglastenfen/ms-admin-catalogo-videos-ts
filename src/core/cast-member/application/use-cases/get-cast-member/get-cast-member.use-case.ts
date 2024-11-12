import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member-output';

export class GetCastMemberUseCase
  implements IUseCase<GetCastMemberInput, GetCastMemberOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: GetCastMemberInput): Promise<GetCastMemberOutput> {
    const castMemberId = new CastMemberId(input.castMemberId);

    const castMember = await this.castMemberRepository.findByID(castMemberId);

    if (!castMember) {
      throw new NotFoundError(input.castMemberId, CastMember);
    }

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type GetCastMemberInput = {
  castMemberId: string;
};

export type GetCastMemberOutput = CastMemberOutput;

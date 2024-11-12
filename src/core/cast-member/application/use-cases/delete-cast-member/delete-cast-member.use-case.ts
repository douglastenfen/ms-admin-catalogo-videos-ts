import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';

export class DeleteCastMemberUseCase
  implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: DeleteCastMemberInput): Promise<void> {
    const castMemberId = new CastMemberId(input.castMemberId);

    await this.castMemberRepository.delete(castMemberId);
  }
}

export type DeleteCastMemberInput = {
  castMemberId: string;
};

export type DeleteCastMemberOutput = void;

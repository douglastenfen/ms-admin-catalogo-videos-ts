import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class CastMembersIdExistsInDatabaseValidator {
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async validate(
    castMembersId: string[],
  ): Promise<Either<CastMemberId[], NotFoundError[]>> {
    const castMembersIdFormatted = castMembersId.map(
      (id) => new CastMemberId(id),
    );

    const existsResult = await this.castMemberRepository.existsById(
      castMembersIdFormatted,
    );

    return existsResult.notExists.length > 0
      ? Either.fail(
          existsResult.notExists.map(
            (ne) => new NotFoundError(ne.id, CastMember),
          ),
        )
      : Either.ok(castMembersIdFormatted);
  }
}

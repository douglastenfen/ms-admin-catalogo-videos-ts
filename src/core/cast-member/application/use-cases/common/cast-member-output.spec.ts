import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutputMapper } from './cast-member-output';

describe('CastMemberOutput Unit Test', () => {
  it('should convert a cast member in an output', () => {
    const aggregate = CastMember.create({
      name: 'John Doe',
      type: CastMemberType.createDirector(),
    });

    const spyToJSON = jest.spyOn(aggregate, 'toJSON');

    const output = CastMemberOutputMapper.toOutput(aggregate);

    expect(spyToJSON).toHaveBeenCalled();

    expect(output).toStrictEqual({
      castMemberId: aggregate.castMemberId.id,
      name: 'John Doe',
      type: CastMemberTypes.DIRECTOR,
      createdAt: aggregate.createdAt,
    });
  });
});

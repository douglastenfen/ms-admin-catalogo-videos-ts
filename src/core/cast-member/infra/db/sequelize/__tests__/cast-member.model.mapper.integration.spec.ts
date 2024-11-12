import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { CastMemberModel } from '../cast-member.model';
import { CastMemberModelMapper } from '../cast-member.model.mapper';
import {
  EntityValidationError,
  LoadEntityError,
} from '@core/shared/domain/validators/validation.error';
import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';

describe('CastMemberModelMapper Integration Test', () => {
  setupSequelize({ models: [CastMemberModel] });

  it('should trhow error when cast member is invalid', () => {
    expect.assertions(2);

    // @ts-expect-error - invalid cast member
    const model = CastMemberModel.build({
      castMemberId: '123e4567-e89b-12d3-a456-426614174000',
    });

    try {
      CastMemberModelMapper.toEntity(model);

      fail('The cast member is valid, but it need to throw a LoadEntityError');
    } catch (e) {
      expect(e).toBeInstanceOf(LoadEntityError);
      expect((e as LoadEntityError).error).toMatchObject([
        { name: ['name must be shorter than or equal to 255 characters'] },
        { type: ['Invalid cast member type: undefined'] },
      ]);
    }
  });

  it('should convert a cast member model to entity', () => {
    const createdAt = new Date();

    const model = CastMemberModel.build({
      castMemberId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Cast Member 1',
      type: CastMemberTypes.DIRECTOR,
      createdAt,
    });

    const entity = CastMemberModelMapper.toEntity(model);

    expect(entity.toJSON()).toStrictEqual(
      new CastMember({
        castMemberId: new CastMemberId('123e4567-e89b-12d3-a456-426614174000'),
        name: 'Cast Member 1',
        type: CastMemberType.createDirector(),
        createdAt,
      }).toJSON(),
    );
  });
});

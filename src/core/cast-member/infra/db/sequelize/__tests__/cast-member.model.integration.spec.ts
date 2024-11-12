import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { setupSequelize } from '@core/shared/infra/testing/sequelize-helper';
import { DataType } from 'sequelize-typescript';
import { CastMemberModel } from '../cast-member.model';

describe('CastMemberModel Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  test('mapping props', async () => {
    const attibutesMap = CastMemberModel.getAttributes();
    const attributes = Object.keys(CastMemberModel.getAttributes());

    expect(attributes).toStrictEqual([
      'castMemberId',
      'name',
      'type',
      'createdAt',
    ]);

    const castMemberIdAttr = attibutesMap.castMemberId;
    expect(castMemberIdAttr).toMatchObject({
      field: 'cast_member_id',
      fieldName: 'castMemberId',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameAttr = attibutesMap.name;
    expect(nameAttr).toMatchObject({
      field: 'name',
      fieldName: 'name',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const typeAttr = attibutesMap.type;
    expect(typeAttr).toMatchObject({
      field: 'type',
      fieldName: 'type',
      allowNull: false,
      type: DataType.SMALLINT(),
    });

    const createdAtAttr = attibutesMap.createdAt;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'createdAt',
      allowNull: false,
      type: DataType.DATE(3),
    });
  });

  test('create', async () => {
    const arrange = {
      castMemberId: 'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3',
      name: 'Any Name',
      type: CastMemberTypes.DIRECTOR,
      createdAt: new Date(),
    };

    const castMember = await CastMemberModel.create(arrange);

    expect(castMember.toJSON()).toStrictEqual(arrange);
  });
});

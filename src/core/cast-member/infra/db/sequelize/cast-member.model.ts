import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

export type CastMemberModelProps = {
  castMemberId: string;
  name: string;
  type: CastMemberTypes;
  createdAt: Date;
};

@Table({ tableName: 'cast_members', timestamps: false })
export class CastMemberModel extends Model<CastMemberModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID, field: 'cast_member_id' })
  declare castMemberId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare type: CastMemberTypes;

  @Column({ allowNull: false, type: DataType.DATE(3), field: 'created_at' })
  declare createdAt: Date;
}

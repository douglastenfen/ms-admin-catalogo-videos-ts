import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export type UpdateCastMemberInputConstructorProps = {
  castMemberId: string;
  name?: string;
  type?: CastMemberTypes;
};

export class UpdateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  castMemberId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  type?: CastMemberTypes;

  constructor(props: UpdateCastMemberInputConstructorProps) {
    if (!props) return;

    this.castMemberId = props.castMemberId;

    props.name && (this.name = props.name);
    props.type && (this.type = props.type);
  }
}

export class ValidateUpdateCastMemberInput {
  static validate(input: UpdateCastMemberInput) {
    return validateSync(input);
  }
}

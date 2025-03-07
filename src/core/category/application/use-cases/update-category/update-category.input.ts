import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export type UpdateCategoryInputConstructorProps = {
  categoryID: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

export class UpdateCategoryInput {
  @IsString()
  @IsNotEmpty()
  categoryID: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  constructor(props: UpdateCategoryInputConstructorProps) {
    if (!props) return;

    this.categoryID = props.categoryID;

    props.name && (this.name = props.name);
    props.description && (this.description = props.description);
    props.isActive !== null &&
      props.isActive !== undefined &&
      (this.isActive = props.isActive);
  }
}

export class ValidateUpdateCategoryInput {
  static validate(input: UpdateCategoryInput) {
    return validateSync(input);
  }
}

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';

export type CreateGenreInputConstructorProps = {
  name: string;
  categoriesId: string[];
  isActive?: boolean;
};

export class CreateGenreInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categoriesId: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  constructor(props: CreateGenreInputConstructorProps) {
    if (!props) return;

    this.name = props.name;
    this.categoriesId = props.categoriesId;
    this.isActive = props.isActive ?? true;
  }
}

export class ValidateCreateGenreInput {
  static validate(input: CreateGenreInput) {
    return validateSync(input);
  }
}

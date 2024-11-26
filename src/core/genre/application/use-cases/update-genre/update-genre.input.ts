import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';

export type UpdateGenreInputConstructorProps = {
  genreId: string;
  name?: string;
  categoriesId?: string[];
  isActive?: boolean;
};

export class UpdateGenreInput {
  @IsString()
  @IsNotEmpty()
  genreId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categoriesId?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  constructor(props?: UpdateGenreInputConstructorProps) {
    if (!props) return;

    this.genreId = props.genreId;
    props.name && (this.name = props.name);
    props.categoriesId &&
      props.categoriesId.length > 0 &&
      (this.categoriesId = props.categoriesId);
    props.isActive !== null &&
      props.isActive !== undefined &&
      (this.isActive = props.isActive);
  }
}

export class ValidateUpdateGenreInput {
  static validate(input: UpdateGenreInput) {
    return validateSync(input);
  }
}

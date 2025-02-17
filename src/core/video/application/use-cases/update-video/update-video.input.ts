import { RatingValues } from '@core/video/domain/rating.vo';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  validateSync,
} from 'class-validator';

export type UpdateVideoInputConstructorProps = {
  id: string;
  title?: string;
  description?: string;
  releasedYear?: number;
  duration?: number;
  rating?: RatingValues;
  isOpened?: boolean;
  categoriesId?: string[];
  genresId?: string[];
  castMembersId?: string[];
};

export class UpdateVideoInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Min(1870)
  @IsInt()
  @IsOptional()
  releasedYear?: number;

  @Min(1)
  @IsInt()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  rating?: RatingValues;

  @IsBoolean()
  @IsOptional()
  isOpened?: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categoriesId?: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  genresId?: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  castMembersId?: string[];

  constructor(props?: UpdateVideoInputConstructorProps) {
    if (!props) return;

    this.id = props.id;
    props.title && (this.title = props.title);
    props.description && (this.description = props.description);
    props.releasedYear && (this.releasedYear = props.releasedYear);
    props.duration && (this.duration = props.duration);
    props.rating && (this.rating = props.rating);
    props.isOpened !== null &&
      props.isOpened !== undefined &&
      (this.isOpened = props.isOpened);
    props.categoriesId &&
      props.categoriesId.length > 0 &&
      (this.categoriesId = props.categoriesId);
    props.genresId &&
      props.genresId.length > 0 &&
      (this.genresId = props.genresId);
    props.castMembersId &&
      props.castMembersId.length > 0 &&
      (this.castMembersId = props.castMembersId);
  }
}

export class ValidateUpdateVideoInput {
  static validate(props: UpdateVideoInput) {
    return validateSync(props);
  }
}

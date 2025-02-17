import { RatingValues } from '@core/video/domain/rating.vo';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  validateSync,
} from 'class-validator';

export type CreateVideoInputConstructorProps = {
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  rating: RatingValues;
  isOpened: boolean;
  categoriesId: string[];
  genresId: string[];
  castMembersId: string[];
  isActive: boolean;
};

export class CreateVideoInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(1870)
  @IsInt()
  @IsNotEmpty()
  releasedYear: number;

  @Min(1)
  @IsInt()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  rating: RatingValues;

  @IsBoolean()
  @IsNotEmpty()
  isOpened: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categoriesId: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  genresId: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  castMembersId: string[];

  constructor(props: CreateVideoInputConstructorProps) {
    if (!props) return;

    this.title = props.title;
    this.description = props.description;
    this.releasedYear = props.releasedYear;
    this.duration = props.duration;
    this.rating = props.rating;
    this.isOpened = props.isOpened;
    this.categoriesId = props.categoriesId;
    this.genresId = props.genresId;
    this.castMembersId = props.castMembersId;
  }
}

export class ValidateCreateVideoInput {
  static validate(input: CreateVideoInput) {
    return validateSync(input);
  }
}

import { UpdateGenreInput } from '@core/genre/application/use-cases/update-genre/update-genre.input';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateGenreInputWithoutId extends OmitType(UpdateGenreInput, [
  'genreId',
] as any) {}

export class UpdateGenreDto extends UpdateGenreInputWithoutId {}

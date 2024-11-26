import { SearchInput } from '@core/shared/application/search-input';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { IsArray, IsUUID, ValidateNested, validateSync } from 'class-validator';

export class ListGenresFilter {
  name?: string;

  @IsUUID(4, { each: true })
  @IsArray()
  categoriesId?: string[];
}

export class ListGenresInput implements SearchInput<ListGenresFilter> {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDir?: SortDirection;
  @ValidateNested()
  filter?: ListGenresFilter;
}

export class ValidateListGenresInput {
  static validate(input: ListGenresInput) {
    return validateSync(input);
  }
}

import { ICategoryRepository } from '@core/category/domain/category.repository';
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from '@core/genre/domain/genre.repository';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/shared/application/pagination-output';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output';
import { ListGenresInput } from './list-genres.input';
import { CategoryId } from '@core/category/domain/category.aggregate';

export class ListGenresUseCase
  implements IUseCase<ListGenresInput, ListGenresOutput>
{
  constructor(
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const params = GenreSearchParams.create(input);

    const searchResult = await this.genreRepository.search(params);

    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: GenreSearchResult,
  ): Promise<ListGenresOutput> {
    const { items: _items } = searchResult;

    const categoriesIdRelated = searchResult.items.reduce<CategoryId[]>(
      (acc, item) => {
        return acc.concat([...item.categoriesId.values()]);
      },
      [],
    );

    const categoriesRelated =
      await this.categoryRepository.findByIds(categoriesIdRelated);

    const items = _items.map((item) => {
      const categoriesOfGenre = categoriesRelated.filter((category) =>
        item.categoriesId.has(category.categoryID.id),
      );
      return GenreOutputMapper.toOutput(item, categoriesOfGenre);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListGenresOutput = PaginationOutput<GenreOutput>;

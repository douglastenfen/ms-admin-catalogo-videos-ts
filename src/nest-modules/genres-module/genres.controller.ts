import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { CreateGenreUseCase } from '@core/genre/application/use-cases/create-genre/create-genre.use-case';
import { GetGenreUseCase } from '@core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';
import { UpdateGenreUseCase } from '@core/genre/application/use-cases/update-genre/update-genre.use-case';
import { DeleteGenreUseCase } from '@core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GenreOutput } from '@core/genre/application/use-cases/common/genre-output';
import { GenreCollectionPresenter, GenrePresenter } from './genres.presenter';
import { SearchGenresDto } from './dto/search-genres.dto';
import { UpdateGenreInput } from '@core/genre/application/use-cases/update-genre/update-genre.input';

@Controller('genres')
export class GenresController {
  @Inject(CreateGenreUseCase)
  private createGenreUseCase: CreateGenreUseCase;

  @Inject(GetGenreUseCase)
  private getGenreUseCase: GetGenreUseCase;

  @Inject(ListGenresUseCase)
  private listGenresUseCase: ListGenresUseCase;

  @Inject(UpdateGenreUseCase)
  private updateGenreUseCase: UpdateGenreUseCase;

  @Inject(DeleteGenreUseCase)
  private deleteGenreUseCase: DeleteGenreUseCase;

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const output = await this.createGenreUseCase.execute(createGenreDto);

    return GenresController.serialize(output);
  }

  @Get()
  async search(@Query() searchParams: SearchGenresDto) {
    const output = await this.listGenresUseCase.execute(searchParams);

    return new GenreCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getGenreUseCase.execute({ genreId: id });

    return GenresController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const input = new UpdateGenreInput({ genreId: id, ...updateGenreDto });

    const output = await this.updateGenreUseCase.execute(input);

    return GenresController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.deleteGenreUseCase.execute({ genreId: id });
  }

  static serialize(output: GenreOutput) {
    return new GenrePresenter(output);
  }
}

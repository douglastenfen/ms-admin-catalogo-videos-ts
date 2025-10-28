import { CastMemberOutput } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { CreateCastMemberUseCase } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { GetCastMemberUseCase } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersUseCase } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { UpdateCastMemberInput } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.input';
import { UpdateCastMemberUseCase } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
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
  UseGuards,
} from '@nestjs/common';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from './cast-members.presenter';
import { CreateCastMemberDto } from './dto/create-cast-member.dto';
import { SearchCastMembersDto } from './dto/search-cast-members.dto';
import { UpdateCastMemberDto } from './dto/update-cast-member.dto';
import { AuthGuard } from '../auth-module/auth.guard';
import { CheckAdminRoleGuard } from '../auth-module/check-admin-role.guard';

@UseGuards(AuthGuard, CheckAdminRoleGuard)
@Controller('cast-members')
export class CastMembersController {
  @Inject(CreateCastMemberUseCase)
  private createCastMemberUseCase: CreateCastMemberUseCase;

  @Inject(GetCastMemberUseCase)
  private getCastMemberUseCase: GetCastMemberUseCase;

  @Inject(ListCastMembersUseCase)
  private listCastMembersUseCase: ListCastMembersUseCase;

  @Inject(UpdateCastMemberUseCase)
  private updateCastMemberUseCase: UpdateCastMemberUseCase;

  @Inject(DeleteCastMemberUseCase)
  private deleteCastMemberUseCase: DeleteCastMemberUseCase;

  @Post()
  async create(@Body() createCastMemberDto: CreateCastMemberDto) {
    const output =
      await this.createCastMemberUseCase.execute(createCastMemberDto);

    return new CastMemberPresenter(output);
  }

  @Get()
  async search(@Query() searchParamsDto: SearchCastMembersDto) {
    const output = await this.listCastMembersUseCase.execute(searchParamsDto);

    return new CastMemberCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getCastMemberUseCase.execute({
      castMemberId: id,
    });

    return CastMembersController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateCastMemberDto: UpdateCastMemberDto,
  ) {
    const input = new UpdateCastMemberInput({
      castMemberId: id,
      ...updateCastMemberDto,
    });

    const output = await this.updateCastMemberUseCase.execute(input);

    return CastMembersController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.deleteCastMemberUseCase.execute({ castMemberId: id });
  }

  static serialize(output: CastMemberOutput) {
    return new CastMemberPresenter(output);
  }
}

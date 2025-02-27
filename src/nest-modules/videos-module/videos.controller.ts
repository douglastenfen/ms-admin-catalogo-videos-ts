import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediaUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-media.use-case';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';

@Controller('videos')
export class VideosController {
  @Inject(CreateVideoUseCase)
  private createUseCase: CreateVideoUseCase;

  @Inject(UpdateVideoUseCase)
  private updateUseCase: UpdateVideoUseCase;

  @Inject(UploadAudioVideoMediaUseCase)
  private uploadAudioVideoMediaUseCase: UploadAudioVideoMediaUseCase;

  @Inject(GetVideoUseCase)
  private getUseCase: GetVideoUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase.execute(createVideoDto);

    return this.getUseCase.execute({ id });
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.getUseCase.execute({ id });
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateVideoDto: any,
  ) {}

  @Patch(':id/upload')
  async uploadFile(
    @UploadedFiles()
    @Body()
    data,
  ) {}
}

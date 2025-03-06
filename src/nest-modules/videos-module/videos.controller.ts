import {
  BadRequestException,
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
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediaUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-media.use-case';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';
import { UpdateVideoInput } from '@core/video/application/use-cases/update-video/update-video.input';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadAudioVideoMediaInput } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-media.input';

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

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnailHalf', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateVideoDto: any,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnailHalf?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const hasFiles = files ? Object.keys(files).length : false;
    const hasData = Object.keys(updateVideoDto).length > 0;

    if (hasFiles && hasData) {
      throw new BadRequestException('Files and data cannot be sent together');
    }

    if (hasData) {
      const data = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(updateVideoDto, { metatype: UpdateVideoDto, type: 'body' });

      const input = new UpdateVideoInput({ id, ...data });

      await this.updateUseCase.execute(input);
    }

    const hasMoreThanOneFile = Object.keys(files).length > 1;

    if (hasMoreThanOneFile) {
      throw new BadRequestException('Only one file can be sent');
    }

    const hasAudioVideMedia = files.trailer?.length || files.video?.length;

    const fileField = Object.keys(files)[0];
    const file = files[fileField][0];

    if (hasAudioVideMedia) {
      const dto: UploadAudioVideoMediaInput = {
        videoId: id,
        field: fileField as any,
        file: {
          rawName: file.originalname,
          data: file.buffer,
          mimeType: file.mimetype,
          size: file.size,
        },
      };

      const input = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(dto, { metatype: UploadAudioVideoMediaInput, type: 'body' });

      await this.uploadAudioVideoMediaUseCase.execute(input);
    }

    return this.getUseCase.execute({ id });
  }

  @Patch(':id/upload')
  async uploadFile(
    @UploadedFiles()
    @Body()
    data,
  ) {}
}

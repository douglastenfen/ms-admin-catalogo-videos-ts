import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { ProcessAudioVideoMediaInput } from '@core/video/application/use-cases/process-audio-video-medias/process-audio-video-media.input';
import { ProcessAudioVideoMediaUseCase } from '@core/video/application/use-cases/process-audio-video-medias/process-audio-video-media.use-case';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, UseFilters, ValidationPipe } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { RabbitmqConsumeErrorFilter } from '../rabbitmq-module/rabbitmq-consume-error/rabbitmq-consume-error.filter';

@Injectable()
export class VideosConsumers {
  constructor(private moduleRef: ModuleRef) {}

  @UseFilters(new RabbitmqConsumeErrorFilter())
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'video.convert',
    queue: 'micro-videos/admin',
    allowNonJsonMessages: true,
    queueOptions: {
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'videos.convert',
    },
  })
  async onProcessVideo(msg: {
    video: {
      resourceId: string;
      encodedVideoFolder: string;
      status: 'COMPLETED' | 'FAILED';
    };
  }) {
    const resourceId = `${msg.video?.resourceId}`;

    const [videoId, field] = resourceId.split('.');

    const input = new ProcessAudioVideoMediaInput({
      videoId,
      field: field as 'trailer' | 'video',
      encodedLocation: msg.video?.encodedVideoFolder,
      status: msg.video?.status as AudioVideoMediaStatus,
    });

    await new ValidationPipe({
      errorHttpStatusCode: 422,
    }).transform(input, {
      metatype: ProcessAudioVideoMediaInput,
      type: 'body',
    });

    const useCase = await this.moduleRef.resolve(ProcessAudioVideoMediaUseCase);

    await useCase.execute(input);
  }
}

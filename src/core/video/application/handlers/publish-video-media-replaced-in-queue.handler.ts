import { IIntegrationEventHandler } from '@core/shared/application/domain-event-handler.interface';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { AudioVideoMediaUploadedIntegrationEvent } from '@core/video/domain/domain-events/audio-video-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoMediaReplacedInQueueHandler
  implements IIntegrationEventHandler
{
  constructor(private messageBroker: IMessageBroker) {}

  @OnEvent(AudioVideoMediaUploadedIntegrationEvent.name)
  async handle(event: AudioVideoMediaUploadedIntegrationEvent): Promise<void> {
    console.log(event);
  }
}

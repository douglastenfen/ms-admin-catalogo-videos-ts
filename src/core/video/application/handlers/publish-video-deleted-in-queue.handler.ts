import { IIntegrationEventHandler } from '@core/shared/application/domain-event-handler.interface';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { VideoDeletedEvent, VideoDeletedIntegrationEvent } from '@core/video/domain/domain-events/video-deleted.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoDeletedInQueueHandler
  implements IIntegrationEventHandler
{
  constructor(private messageBroker: IMessageBroker) {}

  @OnEvent(VideoDeletedIntegrationEvent.name)
  async handle(event: VideoDeletedIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }
}

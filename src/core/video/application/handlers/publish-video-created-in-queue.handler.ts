import { IIntegrationEventHandler } from '@core/shared/application/domain-event-handler.interface';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { VideoCreatedIntegrationEvent } from '@core/video/domain/domain-events/video-created.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoCreatedInQueueHandler
  implements IIntegrationEventHandler
{
  constructor(private messageBroker: IMessageBroker) {}

  @OnEvent(VideoCreatedIntegrationEvent.name)
  async handle(event: VideoCreatedIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }
}

import { OnEvent } from '@nestjs/event-emitter';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { GenreUpdatedIntegrationEvent } from '@core/genre/domain/domain-events/genre-updated.event';

export class PublishGenreUpdatedInQueueHandler {
  constructor(private messageBroker: IMessageBroker) {}

  @OnEvent(GenreUpdatedIntegrationEvent.name)
  async handle(event: GenreUpdatedIntegrationEvent) {
    await this.messageBroker.publishEvent(event);
  }
}

import { OnEvent } from '@nestjs/event-emitter';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { GenreCreatedIntegrationEvent } from '@core/genre/domain/domain-events/genre-created.event';

export class PublishGenreCreatedInQueueHandler {
  constructor(private messageBroker: IMessageBroker) {}

  @OnEvent(GenreCreatedIntegrationEvent.name)
  async handle(event: GenreCreatedIntegrationEvent) {
    await this.messageBroker.publishEvent(event);
  }
}

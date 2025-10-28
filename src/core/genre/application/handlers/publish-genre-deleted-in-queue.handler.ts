import { OnEvent } from '@nestjs/event-emitter';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { GenreDeletedIntegrationEvent } from '@core/genre/domain/domain-events/genre-deleted.event';

export class PublishGenreDeletedInQueueHandler {
  constructor(private messageBroker: IMessageBroker) {}

  @OnEvent(GenreDeletedIntegrationEvent.name)
  async handle(event: GenreDeletedIntegrationEvent) {
    await this.messageBroker.publishEvent(event);
  }
}

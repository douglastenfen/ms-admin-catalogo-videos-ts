import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';

export class InMemoryMessageBroker implements IMessageBroker {
  private handlers: { [key: string]: (event: IDomainEvent) => Promise<void> } =
    {};

  async publishEvent(event: IDomainEvent): Promise<void> {
    const handler = this.handlers[event.constructor.name];

    if (handler) {
      await handler(event);
    }
  }
}

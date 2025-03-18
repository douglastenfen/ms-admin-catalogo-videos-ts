import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { IIntegrationEvent } from '@core/shared/domain/events/domain-event.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EVENTS_MESSAGE_BROKER_CONFIG } from './events-message-broker.config';

export class RabbitMQMessageBroker implements IMessageBroker {
  constructor(private connection: AmqpConnection) {}

  async publishEvent(event: IIntegrationEvent): Promise<void> {
    const config = EVENTS_MESSAGE_BROKER_CONFIG[event.constructor.name];

    await this.connection.publish(config.exchange, config.routingKey, event);
  }
}

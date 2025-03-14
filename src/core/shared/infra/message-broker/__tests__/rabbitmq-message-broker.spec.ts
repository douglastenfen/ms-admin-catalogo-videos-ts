import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { ChannelWrapper } from 'amqp-connection-manager';
import { RabbitMQMessageBroker } from '../rabbitmq-message-broker';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '../events-message-broker.config';

class TestEvent implements IDomainEvent {
  occurredOn: Date = new Date();
  eventVersion: number = 1;

  constructor(readonly aggregateId: Uuid) {}
}

describe('RabbitMQMessageBroker Unit Tests', () => {
  let service: RabbitMQMessageBroker;
  let connection: ChannelWrapper;

  beforeEach(async () => {
    connection = {
      publish: jest.fn(),
    } as any;

    service = new RabbitMQMessageBroker(connection as any);
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid());

      await service.publishEvent(event);

      expect(connection.publish).toHaveBeenCalledWith(
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].exchange,
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].routingKey,
        event,
      );
    });
  });
});

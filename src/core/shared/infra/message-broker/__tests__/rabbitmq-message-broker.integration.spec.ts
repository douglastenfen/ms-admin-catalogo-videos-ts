import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Config } from '../../config';
import { RabbitMQMessageBroker } from '../rabbitmq-message-broker';
import { ConsumeMessage } from 'amqplib';

class TestEvent implements IDomainEvent {
  occurredOn: Date = new Date();
  eventVersion: number = 1;

  constructor(readonly aggregateId: Uuid) {}
}

describe('RabbitMQMessageBroker Unit Tests', () => {
  let service: RabbitMQMessageBroker;
  let connection: AmqpConnection;

  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitmqUri(),
      connectionInitOptions: { wait: true },
      logger: {
        debug: () => {},
        error: () => {},
        info: () => {},
        warn: () => {},
        log: () => {},
      } as any,
    });
    await connection.init();

    const channel = await connection.channel;
    await channel.assertExchange('test-exchange', 'direct', { durable: false });
    await channel.assertQueue('test-queue', { durable: false });
    await channel.purgeQueue('test-queue');
    await channel.bindQueue('test-queue', 'test-exchange', 'TestEvent');

    service = new RabbitMQMessageBroker(connection);
  });

  afterEach(async () => {
    try {
      await connection.managedConnection.close();
    } catch (err) {
      console.log(err);
    }
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid());

      await service.publishEvent(event);

      const message: ConsumeMessage = await new Promise((resolve) => {
        connection.channel.consume('test-queue', (message) => {
          resolve(message);
        });
      });

      const messageObject = JSON.parse(message.content.toString());

      expect(messageObject).toEqual({
        aggregateId: { id: event.aggregateId.id },
        eventVersion: event.eventVersion,
        occurredOn: event.occurredOn.toISOString(),
      });
    });
  });
});

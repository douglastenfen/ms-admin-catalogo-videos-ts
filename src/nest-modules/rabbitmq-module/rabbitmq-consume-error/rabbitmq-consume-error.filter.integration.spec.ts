import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleInit, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { RabbitmqModule } from '../rabbitmq.module';
import { RabbitmqConsumeErrorFilter } from './rabbitmq-consume-error.filter';

const queue1 = 'test-retry-1';
const queue2 = 'test-retry-2';
const queue3 = 'test-retry-3';

@UseFilters(RabbitmqConsumeErrorFilter)
@Injectable()
class StubConsumer {
  @RabbitSubscribe({
    exchange: 'direct.delayed',
    routingKey: queue1,
    queue: queue1,
    allowNonJsonMessages: true,
    queueOptions: {
      durable: false,
    },
  })
  handle1() {
    this.throwError();
  }

  @RabbitSubscribe({
    exchange: 'direct.delayed',
    routingKey: queue2,
    queue: queue2,
    allowNonJsonMessages: true,
    queueOptions: {
      durable: false,
    },
  })
  handle2() {
    this.throwError();
  }

  @RabbitSubscribe({
    exchange: 'direct.delayed',
    routingKey: queue3,
    queue: queue3,
    allowNonJsonMessages: true,
    queueOptions: {
      durable: false,
    },
  })
  handle3() {
    this.throwError();
  }

  throwError() {}
}

@Injectable()
export class PurgeRetryQueue implements OnModuleInit {
  constructor(private amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    await this.purgeRetryQueue();
  }

  async purgeRetryQueue() {
    const channelWrapper =
      this.amqpConnection.managedConnection.createChannel();

    await channelWrapper.addSetup((channel) => {
      return Promise.all([
        channel.purgeQueue(queue1),
        channel.purgeQueue(queue2),
        channel.purgeQueue(queue3),
      ]);
    });

    await channelWrapper.close();
  }
}

class FakeError extends Error {}

describe('RabbitmqConsumeErrorFilter Integration Tests', () => {
  let filter: RabbitmqConsumeErrorFilter;
  let module: TestingModule;
  let consumer: StubConsumer;
  let amqpConnection: AmqpConnection;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        RabbitmqModule.forRoot({ enableConsumers: true }),
      ],
      providers: [RabbitmqConsumeErrorFilter, StubConsumer, PurgeRetryQueue],
    }).compile();

    await module.init();

    filter = module.get<RabbitmqConsumeErrorFilter>(RabbitmqConsumeErrorFilter);
    consumer = module.get<StubConsumer>(StubConsumer);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should not retry if error is non-retryable', async () => {
    const spyThrowError = jest
      .spyOn(consumer, 'throwError')
      .mockImplementation(() => {
        throw new EntityValidationError([]);
      });

    const spyRetry = jest.spyOn(filter, 'retry' as any);

    await amqpConnection.publish('direct.delayed', queue1, 'test');

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(spyRetry).not.toHaveBeenCalled();
    expect(spyThrowError).toHaveBeenCalled();
  });

  it('should retry if error is retryable and retry count is less than max retries', async () => {
    const spyThrowError = jest
      .spyOn(consumer, 'throwError')
      .mockImplementation(() => {
        throw new Error();
      });

    const spyPublish = jest.spyOn(amqpConnection, 'publish' as any);

    await amqpConnection.publish('direct.delayed', queue2, 'test');

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(spyThrowError).toHaveBeenCalled();
    expect(spyPublish).toHaveBeenCalledWith(
      'direct.delayed',
      queue2,
      Buffer.from(JSON.stringify('test')),
      {
        correlationId: undefined,
        headers: { 'x-delay': 5000, 'x-retry-count': 1 },
      },
    );
  });

  it('should not retry if error is retryable and retry count is greater than max retries', async () => {
    const spyThrowError = jest
      .spyOn(consumer, 'throwError')
      .mockImplementation(() => {
        throw new FakeError();
      });

    const spyRetry = jest.spyOn(filter, 'retry' as any);

    await amqpConnection.publish('direct.delayed', queue3, 'test', {
      headers: { 'x-retry-count': 3 },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(spyThrowError).toHaveBeenCalled();
    expect(spyRetry).not.toHaveBeenCalled();
  });
});

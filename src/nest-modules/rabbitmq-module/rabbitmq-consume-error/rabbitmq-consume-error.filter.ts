import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConsumeMessage, MessagePropertyHeaders } from 'amqplib';

@Catch()
export class RabbitmqConsumeErrorFilter implements ExceptionFilter {
  static readonly RETRY_COUNT_HEADER = 'x-retry-count';
  static readonly MAX_RETRIES = 3;
  static readonly NON_RETRYABLE_ERRORS = [
    NotFoundError,
    EntityValidationError,
    UnprocessableEntityException,
  ];

  constructor(private amqConnection: AmqpConnection) {}

  async catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq') {
      return;
    }

    const hasRetryableError =
      RabbitmqConsumeErrorFilter.NON_RETRYABLE_ERRORS.some(
        (error) => exception instanceof error,
      );

    if (hasRetryableError) {
      return new Nack(false);
    }

    const ctx = host.switchToRpc().getContext();
    const message: ConsumeMessage = ctx.getMessage();

    if (this.shouldRetry(message.properties.headers!)) {
      await this.retry(message);
    } else {
      return new Nack(false);
    }
  }

  private shouldRetry(messageHeaders: MessagePropertyHeaders): boolean {
    const retryHeader = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;
    const maxRetries = RabbitmqConsumeErrorFilter.MAX_RETRIES;

    return (
      !(retryHeader in messageHeaders) ||
      messageHeaders[retryHeader] < maxRetries
    );
  }

  private async retry(message: ConsumeMessage) {
    const messageHeaders = message.properties.headers!;
    const retryHeader = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;

    messageHeaders[retryHeader] = messageHeaders[retryHeader]
      ? messageHeaders[retryHeader] + 1
      : 1;

    messageHeaders['x-delay'] = 5000;

    return this.amqConnection.publish(
      'direct.delayed',
      message.fields.routingKey,
      message.content,
      {
        headers: messageHeaders,
      },
    );
  }
}

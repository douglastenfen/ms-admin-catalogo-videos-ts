import { ValueObject } from '@core/shared/domain/value-object';
import { Notification } from '../../domain/validators/notification';

expect.extend({
  notificationContainsErrorMessages(
    expected: Notification,
    received: Array<string | { [key: string]: string[] }>,
  ) {
    const every = received.every((error) => {
      if (typeof error === 'string') {
        return expected.errors.has(error);
      } else {
        return Object.entries(error).every(([field, messages]) => {
          const fieldMessages = expected.errors.get(field) as string[];

          return (
            fieldMessages &&
            fieldMessages.length &&
            fieldMessages.every((message) => messages.includes(message))
          );
        });
      }
    });
    return every
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () =>
            `The notification errors not contains ${JSON.stringify(
              received,
            )}. Current: ${JSON.stringify(expected.toJSON())}`,
        };
  },

  toBeValueObject(expected: ValueObject, received: ValueObject) {
    return expected.equals(received)
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () =>
            `The value objects are not equals. Expected: ${JSON.stringify(expected)} | Received: ${JSON.stringify(received)}`,
        };
  },
});

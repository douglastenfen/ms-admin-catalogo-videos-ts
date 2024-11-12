import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { union } from 'lodash';

@Catch(EntityValidationError)
export class EntityValidationErrorFilter implements ExceptionFilter {
  catch(exception: EntityValidationError, host: ArgumentsHost) {
    const context = host.switchToHttp();

    const response = context.getResponse<Response>();

    response.status(422).json({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: union(
        ...exception.error.reduce(
          (acc, error) =>
            acc.concat(
              // @ts-expect-error error can be a string or an object
              typeof error === 'string'
                ? [[error]]
                : [
                    Object.values(error).reduce(
                      (acc, error) => acc.concat(error),
                      [] as string[],
                    ),
                  ],
            ),
          [] as string[],
        ),
      ),
    });
  }
}

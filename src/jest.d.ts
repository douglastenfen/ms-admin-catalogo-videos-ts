import { FieldsErrors } from './shared/domain/validators/class-validator-fields-interface';

declare global {
  namespace jest {
    interface Matchers<R> {
      containsErrorMessages(expected: FieldsErrors): R;
    }
  }
}

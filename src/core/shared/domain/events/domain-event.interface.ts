import { ValueObject } from '../value-object';

export interface IDomainEvent {
  aggregateId: ValueObject;
  occurredOn: Date;
  eventVersion: number;
}

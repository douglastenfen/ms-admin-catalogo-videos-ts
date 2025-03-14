import { ValueObject } from '../value-object';

export interface IDomainEvent {
  aggregateId: ValueObject;
  occurredOn: Date;
  eventVersion: number;

  getIntegrationEvent?(): IIntegrationEvent;
}

export interface IIntegrationEvent<T = any> {
  eventVersion: number;
  ocurredOn: Date;
  payload: T;
  eventName: string;
}

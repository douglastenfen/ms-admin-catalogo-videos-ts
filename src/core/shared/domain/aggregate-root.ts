import { Entity } from './entity';
import { IDomainEvent } from './events/domain-event.interface';

export abstract class AggregateRoot extends Entity {
  applyEvent(event: IDomainEvent) {}

  registerHandler(event: string, handler: (event: IDomainEvent) => void) {}
}

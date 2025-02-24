import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../../aggregate-root';
import { ValueObject } from '../../value-object';
import { Uuid } from '../../value-objects/uuid.vo';
import { DomainEventMediator } from '../domain-event.mediator';
import { IDomainEvent } from '../domain-event.interface';

class StubEvent implements IDomainEvent {
  occurredOn: Date;
  eventVersion: number;

  constructor(
    public aggregateId: Uuid,
    public name: string,
  ) {
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}
class StubAggregate extends AggregateRoot {
  id: Uuid;
  name: string;

  get entityId(): ValueObject {
    return this.id;
  }

  action(name) {
    this.name = name;
    this.applyEvent(new StubEvent(this.id, this.name));
  }

  toJSON() {
    return {
      id: this.id.toString(),
      name: this.name,
    };
  }
}

describe('DomainEventMediator Unit Tests', () => {
  let mediator: DomainEventMediator;

  beforeEach(() => {
    const eventEmmiter = new EventEmitter2();
    mediator = new DomainEventMediator(eventEmmiter);
  });

  it('should publish a handler', async () => {
    mediator.register(StubEvent.name, (event: StubEvent) => {
      expect(event.name).toBe('test');
    });

    const aggregate = new StubAggregate();

    aggregate.action('test');

    await mediator.publish(aggregate);
  });
});

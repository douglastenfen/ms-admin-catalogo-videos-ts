import { AggregateRoot } from '../aggregate-root';
import { IDomainEvent } from '../events/domain-event.interface';
import { ValueObject } from '../value-object';
import { Uuid } from '../value-objects/uuid.vo';

class StubEvent implements IDomainEvent {
  occurredOn: Date;
  eventVersion: number = 1;

  constructor(
    public aggregateId: Uuid,
    public name: string,
  ) {
    this.occurredOn = new Date();
    this.name;
  }
}

class StubAggregateRoot extends AggregateRoot {
  aggregateId: Uuid;
  name: string;
  field1: string;

  constructor(name: string, id: Uuid) {
    super();
    this.aggregateId = id;
    this.name = name;
    this.registerHandler(StubEvent.name, this.onStubEvent.bind(this));
  }

  operation() {
    this.name = this.name.toUpperCase();
    this.applyEvent(new StubEvent(this.aggregateId, this.name));
  }

  onStubEvent(event: StubEvent) {
    this.field1 = event.name;
  }

  get entityId(): ValueObject {
    return this.aggregateId;
  }

  toJSON() {
    return {
      aggregateId: this.aggregateId.toString(),
      name: this.name,
      field1: this.field1,
    };
  }
}

describe('AggregateRoot Unit Tests', () => {
  test('dispatch event', () => {
    const id = new Uuid();

    const aggregate = new StubAggregateRoot('name', id);

    aggregate.operation();

    expect(aggregate.field1).toBe('NAME');
  });
});

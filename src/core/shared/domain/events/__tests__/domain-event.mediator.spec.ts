import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../../aggregate-root';
import { ValueObject } from '../../value-object';
import { Uuid } from '../../value-objects/uuid.vo';
import { IDomainEvent, IIntegrationEvent } from '../domain-event.interface';
import { DomainEventMediator } from '../domain-event.mediator';

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

  getIntegrationEvent(): StubIntegrationEvent {
    return new StubIntegrationEvent(this);
  }
}

class StubIntegrationEvent implements IIntegrationEvent {
  eventVersion: number;
  occurredOn: Date;
  payload: any;
  eventName: string;

  constructor(event: StubEvent) {
    this.eventVersion = event.eventVersion;
    this.occurredOn = event.occurredOn;
    this.payload = event;
    this.eventName = this.constructor.name;
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

  it('should not publish an integration event', async () => {
    expect.assertions(1);

    const spyEmitAsync = jest.spyOn(mediator['eventEmitter'], 'emitAsync');

    const aggregate = new StubAggregate();
    aggregate.action('test');
    Array.from(aggregate.events)[0].getIntegrationEvent = undefined;

    await mediator.publishIntegrationEvents(aggregate);
    expect(spyEmitAsync).not.toHaveBeenCalled();
  });

  it('should publish an integration event', async () => {
    expect.assertions(4);

    mediator.register(
      StubIntegrationEvent.name,
      async (event: StubIntegrationEvent) => {
        expect(event.eventName).toBe(StubIntegrationEvent.name);
        expect(event.eventVersion).toBe(1);
        expect(event.occurredOn).toBeInstanceOf(Date);
        expect(event.payload.name).toBe('test');
      },
    );

    const aggregate = new StubAggregate();

    aggregate.action('test');

    await mediator.publishIntegrationEvents(aggregate);
  });
});

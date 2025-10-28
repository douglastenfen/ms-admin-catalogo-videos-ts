import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { GenreId } from '../genre.aggregate';

export type GenreDeletedEventProps = {
  genreId: GenreId;
  occurredOn?: Date;
};

export class GenreDeletedEvent implements IDomainEvent {
  readonly aggregateId: GenreId;
  readonly occurredOn: Date;
  readonly eventVersion: number;

  constructor(props: GenreDeletedEventProps) {
    this.aggregateId = props.genreId;
    this.occurredOn = props.occurredOn ?? new Date();
    this.eventVersion = 1;
  }

  getIntegrationEvent(): GenreDeletedIntegrationEvent {
    return new GenreDeletedIntegrationEvent(this);
  }
}

export class GenreDeletedIntegrationEvent implements IIntegrationEvent {
  declare eventName: string;
  declare payload: any;
  declare eventVersion: number;
  declare occurredOn: Date;

  constructor(event: GenreDeletedEvent) {
    this['genreId'] = event.aggregateId.id;
    this['occurredOn'] = event.occurredOn;
    this.eventVersion = event.eventVersion;
    this.occurredOn = event.occurredOn;
  }
}

import { CategoryId } from '@core/category/domain/category.aggregate';
import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { GenreId } from '../genre.aggregate';

export type GenreUpdatedEventProps = {
  genreId: GenreId;
  name: string;
  categoriesId: CategoryId[];
  isActive: boolean;
};

export class GenreUpdatedEvent implements IDomainEvent {
  readonly aggregateId: GenreId;
  readonly occurredOn: Date;
  readonly eventVersion: number;

  readonly name: string;
  readonly categoriesId: CategoryId[];
  readonly isActive: boolean;

  constructor(props: GenreUpdatedEventProps) {
    this.aggregateId = props.genreId;
    this.name = props.name;
    this.categoriesId = props.categoriesId;
    this.isActive = props.isActive;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }

  getIntegrationEvent(): GenreUpdatedIntegrationEvent {
    return new GenreUpdatedIntegrationEvent(this);
  }
}

export class GenreUpdatedIntegrationEvent implements IIntegrationEvent {
  declare eventName: string;
  declare payload: any;
  declare eventVersion: number;
  declare occurredOn: Date;

  constructor(event: GenreUpdatedEvent) {
    this['genreId'] = event.aggregateId.id;
    this['name'] = event.name;
    this['categoriesId'] = event.categoriesId.map((c) => c.id);
    this['isActive'] = event.isActive;
    this.eventVersion = event.eventVersion;
    this.occurredOn = event.occurredOn;
  }
}

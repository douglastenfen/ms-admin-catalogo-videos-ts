import { CategoryId } from '@core/category/domain/category.aggregate';
import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { GenreId } from '../genre.aggregate';

export type GenreCreatedEventProps = {
  genreId: GenreId;
  name: string;
  categoriesId: CategoryId[];
  isActive: boolean;
  createdAt: Date;
};

export class GenreCreatedEvent implements IDomainEvent {
  readonly aggregateId: GenreId;
  readonly occurredOn: Date;
  readonly eventVersion: number;

  readonly name: string;
  readonly categoriesId: CategoryId[];
  readonly isActive: boolean;
  readonly createdAt: Date;

  constructor(props: GenreCreatedEventProps) {
    this.aggregateId = props.genreId;
    this.name = props.name;
    this.categoriesId = props.categoriesId;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }

  getIntegrationEvent(): GenreCreatedIntegrationEvent {
    return new GenreCreatedIntegrationEvent(this);
  }
}

export class GenreCreatedIntegrationEvent implements IIntegrationEvent {
  declare eventName: string;
  declare payload: any;
  declare eventVersion: number;
  declare occurredOn: Date;

  constructor(event: GenreCreatedEvent) {
    this['genreId'] = event.aggregateId.id;
    this['name'] = event.name;
    this['categoriesId'] = event.categoriesId.map((c) => c.id);
    this['isActive'] = event.isActive;
    this['createdAt'] = event.createdAt;
    this.eventVersion = event.eventVersion;
    this.occurredOn = event.occurredOn;
  }
}

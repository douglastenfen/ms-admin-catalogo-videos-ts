import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { VideoId } from '../video.aggregate';

export type VideoDeletedEventProps = {
  videoId: VideoId;
  occurredOn?: Date;
};

export class VideoDeletedEvent implements IDomainEvent {
  readonly aggregateId: VideoId;
  readonly occurredOn: Date;
  readonly eventVersion: number;

  constructor(props: VideoDeletedEventProps) {
    this.aggregateId = props.videoId;
    this.occurredOn = props.occurredOn ?? new Date();
    this.eventVersion = 1;
  }

  getIntegrationEvent(): VideoDeletedIntegrationEvent {
    return new VideoDeletedIntegrationEvent(this);
  }
}

export class VideoDeletedIntegrationEvent implements IIntegrationEvent {
  declare eventName: string;
  declare payload: any;
  declare eventVersion: number;
  declare occurredOn: Date;

  constructor(event: VideoDeletedEvent) {
    this['videoId'] = event.aggregateId.id;
    this['occurredOn'] = event.occurredOn;
    this.eventVersion = event.eventVersion;
    this.occurredOn = event.occurredOn;
  }
}

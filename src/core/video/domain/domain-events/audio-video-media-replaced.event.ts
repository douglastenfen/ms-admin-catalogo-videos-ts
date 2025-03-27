import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { VideoId } from '../video.aggregate';

type AudioVideoMediaReplacedProps = {
  aggregateId: VideoId;
  media: Trailer | VideoMedia;
  mediaType: 'trailer' | 'video';
};

export class AudioVideoMediaReplacedEvent implements IDomainEvent {
  aggregateId: VideoId;
  occurredOn: Date;
  eventVersion: number;

  readonly media: Trailer | VideoMedia;
  readonly mediaType: 'trailer' | 'video';

  constructor(props: AudioVideoMediaReplacedProps) {
    this.aggregateId = props.aggregateId;
    this.media = props.media;
    this.mediaType = props.mediaType;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }

  getIntegrationEvent(): AudioVideoMediaUploadedIntegrationEvent {
    return new AudioVideoMediaUploadedIntegrationEvent(this);
  }
}

export class AudioVideoMediaUploadedIntegrationEvent
  implements IIntegrationEvent
{
  declare eventName: string;
  declare payload: any;
  declare eventVersion: number;
  declare occurredOn: Date;

  constructor(event: AudioVideoMediaReplacedEvent) {
    this['resourceId'] = `${event.aggregateId.id}.${event.mediaType}`;
    this['filePath'] = event.media.rawUrl;
  }
}

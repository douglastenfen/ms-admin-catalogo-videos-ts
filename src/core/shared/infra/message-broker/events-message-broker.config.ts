import { AudioVideoMediaUploadedIntegrationEvent } from '@core/video/domain/domain-events/audio-video-media-replaced.event';
import { VideoCreatedIntegrationEvent } from '@core/video/domain/domain-events/video-created.event';
import { VideoDeletedIntegrationEvent } from '@core/video/domain/domain-events/video-deleted.event';
import { GenreCreatedIntegrationEvent } from '@core/genre/domain/domain-events/genre-created.event';
import { GenreUpdatedIntegrationEvent } from '@core/genre/domain/domain-events/genre-updated.event';
import { GenreDeletedIntegrationEvent } from '@core/genre/domain/domain-events/genre-deleted.event';

export const EVENTS_MESSAGE_BROKER_CONFIG = {
  [AudioVideoMediaUploadedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: AudioVideoMediaUploadedIntegrationEvent.name,
  },
  [VideoCreatedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: 'video.created',
  },
  [VideoDeletedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: 'video.deleted',
  },
  [GenreCreatedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: 'genre.created',
  },
  [GenreUpdatedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: 'genre.updated',
  },
  [GenreDeletedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: 'genre.deleted',
  },
  TestEvent: {
    exchange: 'test-exchange',
    routingKey: 'TestEvent',
  },
};

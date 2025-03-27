import { AudioVideoMediaUploadedIntegrationEvent } from '@core/video/domain/domain-events/audio-video-media-replaced.event';

export const EVENTS_MESSAGE_BROKER_CONFIG = {
  [AudioVideoMediaUploadedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: AudioVideoMediaUploadedIntegrationEvent.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routingKey: 'TestEvent',
  },
};

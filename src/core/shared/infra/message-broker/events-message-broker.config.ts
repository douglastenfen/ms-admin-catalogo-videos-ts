import { AudioVideoMediaReplacedEvent } from '@core/video/domain/domain-events/audio-video-media-replaced.event';

export const EVENTS_MESSAGE_BROKER_CONFIG = {
  [AudioVideoMediaReplacedEvent.name]: {
    exchange: 'amq.direct',
    routingKey: AudioVideoMediaReplacedEvent.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routingKey: 'TestEvent',
  },
};

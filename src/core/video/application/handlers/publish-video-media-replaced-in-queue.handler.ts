import { IDomainEventHandler } from '@core/shared/application/domain-event-handler.interface';
import { AudioVideoMediaReplacedEvent } from '@core/video/domain/domain-events/audio-video-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoMediaReplacedInQueueHandler
  implements IDomainEventHandler
{
  @OnEvent(AudioVideoMediaReplacedEvent.name)
  async handle(event: AudioVideoMediaReplacedEvent): Promise<void> {
    console.log(event);
  }
}

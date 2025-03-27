import { IUseCase } from '@core/shared/application/use-case.interface';
import { ProcessAudioVideoMediaInput } from './process-audio-video-media.input';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';

export class ProcessAudioVideoMediaUseCase
  implements
    IUseCase<ProcessAudioVideoMediaInput, ProcessAudioVideoMediaOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepository: IVideoRepository,
  ) {}

  async execute(
    input: ProcessAudioVideoMediaInput,
  ): Promise<ProcessAudioVideoMediaOutput> {
    const videoId = new VideoId(input.videoId);
    const video = await this.videoRepository.findByID(videoId);

    if (!video) {
      throw new NotFoundError(input.videoId, Video);
    }

    if (input.field === 'trailer') {
      if (!video.trailer) {
        throw new Error('Trailer not found');
      }

      video.trailer =
        input.status === AudioVideoMediaStatus.COMPLETED
          ? video.trailer.complete(input.encodedLocation)
          : video.trailer.fail();
    }

    if (input.field === 'video') {
      if (!video.video) {
        throw new Error('Video not found');
      }

      video.video =
        input.status === AudioVideoMediaStatus.COMPLETED
          ? video.video.complete(input.encodedLocation)
          : video.video.fail();
    }

    this.uow.do(async () => {
      await this.videoRepository.update(video);
    });
  }
}

type ProcessAudioVideoMediaOutput = void;

import { ApplicationService } from '@core/shared/application/application.service';
import { IStorage } from '@core/shared/application/sotarge.interface';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Trailer } from '@core/video/domain/trailer.vo';
import { VideoMedia } from '@core/video/domain/video-media.vo';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { UploadAudioVideoMediaInput } from './upload-audio-video-media.input';

export class UploadAudioVideoMediaUseCase
  implements IUseCase<UploadAudioVideoMediaInput, UploadAudioVideoMediaOutput>
{
  constructor(
    private appService: ApplicationService,
    private videoRepository: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadAudioVideoMediaInput,
  ): Promise<UploadAudioVideoMediaOutput> {
    const video = await this.videoRepository.findByID(
      new VideoId(input.videoId),
    );

    if (!video) throw new NotFoundError(input.videoId, Video);

    const audioVideoMediaMap = {
      trailer: Trailer,
      video: VideoMedia,
    };

    const audioMediaClass = audioVideoMediaMap[input.field] as
      | typeof Trailer
      | typeof VideoMedia;

    const [audioVideoMedia, errorAudioMedia] = audioMediaClass
      .createFromFile({
        ...input.file,
        videoId: video.videoId,
      })
      .asArray();

    if (errorAudioMedia) {
      throw new EntityValidationError([
        {
          [input.field]: [errorAudioMedia.message],
        },
      ]);
    }

    audioVideoMedia instanceof Trailer && video.replaceTrailer(audioVideoMedia);
    audioVideoMedia instanceof VideoMedia &&
      video.replaceVideo(audioVideoMedia);

    await this.storage.store({
      data: input.file.data,
      id: audioVideoMedia.rawUrl,
      mimeType: input.file.mimeType,
    });

    await this.appService.run(async () => {
      await this.videoRepository.update(video);
    });
  }
}

export type UploadAudioVideoMediaOutput = void;

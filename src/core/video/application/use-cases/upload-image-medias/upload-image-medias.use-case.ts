import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { UploadImageMediasInput } from './upload-image-medias.input';
import { Banner } from '@core/video/domain/banner.vo';
import { Thumbnail } from '@core/video/domain/thumbnail.vo';
import { ThumbnailHalf } from '@core/video/domain/thumbnail-half.vo';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { IStorage } from '@core/shared/application/sotarge.interface';

export class UploadImageMediasUseCase
  implements IUseCase<UploadImageMediasInput, UploadImageMediasOutput>
{
  constructor(
    private videoRepository: IVideoRepository,
    private uow: IUnitOfWork,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadImageMediasInput,
  ): Promise<UploadImageMediasOutput> {
    const videoId = new VideoId(input.videoId);
    const video = await this.videoRepository.findByID(videoId);

    if (!video) {
      throw new NotFoundError(input.videoId, Video);
    }

    const imagesMap = {
      banner: Banner,
      thumbnail: Thumbnail,
      thumbnailHalf: ThumbnailHalf,
    };

    const [image, errorImage] = imagesMap[input.field]
      .createFromFile({
        ...input.file,
        videoId,
      })
      .asArray();

    if (errorImage) {
      throw new EntityValidationError([
        { [input.field]: [errorImage.message] },
      ]);
    }

    image instanceof Banner && video.replaceBanner(image);
    image instanceof Thumbnail && video.replaceThumbnail(image);
    image instanceof ThumbnailHalf && video.replaceThumbnailHalf(image);

    await this.storage.store({
      data: input.file.data,
      mimeType: input.file.mimeType,
      id: image.url,
    });

    await this.uow.do(async () => {
      await this.videoRepository.update(video);
    });
  }
}

export type UploadImageMediasOutput = void;

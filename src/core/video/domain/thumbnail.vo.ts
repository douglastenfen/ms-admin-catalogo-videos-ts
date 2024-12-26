import { ImageMedia } from '@core/shared/domain/value-objects/image-media.vo';
import { VideoId } from './video.aggregate';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from '@core/shared/domain/validators/media-file.validator';
import { Either } from '@core/shared/domain/either';

export class Thumbnail extends ImageMedia {
  static maxSize = 1024 * 1024 * 2; // 2MB

  static mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

  static createFromFile({
    rawName,
    mimeType,
    size,
    videoId,
  }: {
    rawName: string;
    mimeType: string;
    size: number;
    videoId: VideoId;
  }) {
    const mediaFileValidator = new MediaFileValidator(
      Thumbnail.maxSize,
      Thumbnail.mimeTypes,
    );

    return Either.safe<
      Thumbnail,
      InvalidMediaFileSizeError | InvalidMediaFileMimeTypeError
    >(() => {
      const { name } = mediaFileValidator.validate({
        rawName,
        mimeType,
        size,
      });

      return new Thumbnail({
        name: `${videoId.id}-${name}`,
        location: `videos/${videoId.id}/thumbnails`,
      });
    });
  }
}

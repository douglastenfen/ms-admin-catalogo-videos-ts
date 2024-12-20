import {
  AudioVideoMedia,
  AudioVideoMediaStatus,
} from '@core/shared/domain/value-objects/audio-video-media.vo';
import { VideoId } from './video.aggregate';
import { MediaFileValidator } from '@core/shared/domain/validators/media-file.validator';
import { Either } from '@core/shared/domain/either';

export class VideoMedia extends AudioVideoMedia {
  static maxSize = 1024 * 1024 * 1024 * 50; // 50GB

  static mimeTypes = ['video/mp4'];

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
      VideoMedia.maxSize,
      VideoMedia.mimeTypes,
    );

    return Either.safe(() => {
      const { name: newName } = mediaFileValidator.validate({
        rawName,
        mimeType,
        size,
      });

      return VideoMedia.create({
        name: `${videoId.id}-${newName}`,
        rawLocation: `videos/${videoId.id}/videos`,
      });
    });
  }

  static create({ name, rawLocation }) {
    return new VideoMedia({
      name,
      rawLocation,
      status: AudioVideoMediaStatus.PENDING,
    });
  }

  process() {
    return new VideoMedia({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation: this.encodedLocation!,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encodedLocation: string) {
    return new VideoMedia({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new VideoMedia({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation: this.encodedLocation!,
      status: AudioVideoMediaStatus.FAILED,
    });
  }
}

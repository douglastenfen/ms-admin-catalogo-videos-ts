import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
} from '@core/shared/domain/validators/media-file.validator';
import { Banner } from '../banner.vo';
import { VideoId } from '../video.aggregate';

describe('Banner Unit Tests', () => {
  it('should create a Banner object from a valid file', () => {
    const data = Buffer.alloc(1024);

    const videoId = new VideoId();

    const [banner, error] = Banner.createFromFile({
      rawName: 'banner.png',
      mimeType: 'image/png',
      size: data.length,
      videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(banner).toBeInstanceOf(Banner);
    expect(banner.name).toMatch(/\.png$/);
    expect(banner.location).toBe(`videos/${videoId.id}/images`);
  });

  it('should throw an error if the file size is too large', () => {
    const data = Buffer.alloc(Banner.maxSize + 1);

    const videoId = new VideoId();

    const [banner, error] = Banner.createFromFile({
      rawName: 'banner.png',
      mimeType: 'image/png',
      size: data.length,
      videoId,
    }).asArray();

    expect(banner).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
  });

  it('should throw an error if the file type is invalid', () => {
    const data = Buffer.alloc(1024);

    const videoId = new VideoId();

    const [banner, error] = Banner.createFromFile({
      rawName: 'banner.pdf',
      mimeType: 'application/pdf',
      size: data.length,
      videoId,
    }).asArray();

    expect(banner).toBeNull();

    expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
  });
});

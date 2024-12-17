import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from '../media-file.validator';

describe('MediaFileValidator Unit Tests', () => {
  const validator = new MediaFileValidator(1024 * 1024, [
    'image/png',
    'image/jpeg',
  ]);

  it('should throw an error if the file size is too large', () => {
    const data = Buffer.alloc(1024 * 1024 + 1);

    expect(() =>
      validator.validate({
        rawName: 'banner.png',
        mimeType: 'image/png',
        size: data.length,
      }),
    ).toThrow(new InvalidMediaFileSizeError(data.length, validator['maxSize']));
  });

  it('should throw an error if the file type is invalid', () => {
    const data = Buffer.alloc(1024);

    expect(() =>
      validator.validate({
        rawName: 'banner.pdf',
        mimeType: 'application/pdf',
        size: data.length,
      }),
    ).toThrow(
      new InvalidMediaFileMimeTypeError(
        'application/pdf',
        validator['validMimeTypes'],
      ),
    );
  });

  it('should return a valid file name', () => {
    const data = Buffer.alloc(1024);

    const { name } = validator.validate({
      rawName: 'banner.png',
      mimeType: 'image/png',
      size: data.length,
    });

    expect(name).toMatch(/\.png$/);
    expect(name).toHaveLength(68);
  });
});

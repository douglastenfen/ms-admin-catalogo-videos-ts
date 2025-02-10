import { IStorage } from '@core/shared/application/sotarge.interface';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';

export class GoogleCloudStorage implements IStorage {
  constructor(
    private storageSdk: GoogleCloudStorageSdk,
    private bucketName: string,
  ) {}

  store(object: {
    data: Buffer;
    mimeType?: string;
    id: string;
  }): Promise<void> {
    const bucket = this.storageSdk.bucket(this.bucketName);
    const file = bucket.file(object.id);
    return file.save(object.data, {
      metadata: {
        contentType: object.mimeType,
      },
    });
  }

  async get(id: string): Promise<{ data: Buffer; mimeType?: string }> {
    const file = this.storageSdk.bucket(this.bucketName).file(id);

    const [metadata, content] = await Promise.all([
      file.getMetadata(),
      file.download(),
    ]);

    return {
      data: content[0],
      mimeType: metadata[0].contentType,
    };
  }
}

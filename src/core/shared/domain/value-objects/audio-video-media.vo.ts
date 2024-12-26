import { ValueObject } from '../value-object';

export enum AudioVideoMediaStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export abstract class AudioVideoMedia extends ValueObject {
  readonly name: string;
  readonly rawLocation: string;
  readonly encodedLocation: string | null;
  readonly status: AudioVideoMediaStatus;

  constructor({
    name,
    rawLocation,
    encodedLocation,
    status,
  }: {
    name: string;
    rawLocation: string;
    encodedLocation?: string;
    status: AudioVideoMediaStatus;
  }) {
    super();
    this.name = name;
    this.rawLocation = rawLocation;
    this.encodedLocation = encodedLocation ?? null;
    this.status = status;
  }

  get rawUrl(): string {
    return `${this.rawLocation}/${this.name}`;
  }

  toJSON() {
    return {
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation: this.encodedLocation,
      status: this.status,
    };
  }
}

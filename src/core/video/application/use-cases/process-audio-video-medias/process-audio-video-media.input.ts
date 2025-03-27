import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  validateSync,
} from 'class-validator';

export type ProcessAudioVideoMediaInputConstructor = {
  videoId: string;
  encodedLocation: string;
  field: 'trailer' | 'video';
  status: AudioVideoMediaStatus;
};

export class ProcessAudioVideoMediaInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  encodedLocation: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: 'trailer' | 'video';

  @IsIn([AudioVideoMediaStatus.COMPLETED, AudioVideoMediaStatus.FAILED])
  @IsNotEmpty()
  status: AudioVideoMediaStatus;

  constructor(props?: ProcessAudioVideoMediaInputConstructor) {
    if (!props) return;

    this.videoId = props.videoId;
    this.encodedLocation = props.encodedLocation;
    this.field = props.field;
    this.status = props.status;
  }
}

export class ValidateProcessAudioVideoMediaInput {
  static validate(input: ProcessAudioVideoMediaInput) {
    return validateSync(input);
  }
}

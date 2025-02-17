import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { FileMediaInput } from '../../common/file-media.input';

export type UploadAudioVideoMediaInputConstructorProps = {
  videoId: string;
  field: 'trailer' | 'video';
  file: FileMediaInput;
};

export class UploadAudioVideoMediaInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: 'trailer' | 'video';

  @ValidateNested()
  file: FileMediaInput;

  constructor(props: UploadAudioVideoMediaInputConstructorProps) {
    if (!props) return;
    this.videoId = props.videoId;
    this.field = props.field;
    this.file = props.file;
  }
}

export class ValidadeUploadVideoMediaInput {
  static validate(input: UploadAudioVideoMediaInput) {
    return validateSync(input);
  }
}

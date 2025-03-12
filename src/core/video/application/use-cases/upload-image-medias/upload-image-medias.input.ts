import {
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { FileMediaInput } from '../common/file-media.input';

export type UploadImageMediasInputConstructorProps = {
  videoId: string;
  field: 'banner' | 'thumbnail' | 'thumbnailHalf';
  file: FileMediaInput;
};

export class UploadImageMediasInput {
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @IsIn(['banner', 'thumbnail', 'thumbnailHalf'])
  @IsNotEmpty()
  field: 'banner' | 'thumbnail' | 'thumbnailHalf';

  @ValidateNested()
  file: FileMediaInput;

  constructor(props: UploadImageMediasInputConstructorProps) {
    if (!props) return;

    this.videoId = props.videoId;
    this.field = props.field;
    this.file = props.file;
  }
}

export class ValidateUploadImageMediasInput {
  static validate(input: UploadImageMediasInput) {
    return validateSync(input);
  }
}

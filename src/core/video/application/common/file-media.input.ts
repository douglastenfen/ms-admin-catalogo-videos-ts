import { IsInstance, IsInt, IsNotEmpty, IsString } from 'class-validator';

export type FileMediaInputConstructorProps = {
  rawName: string;
  data: Buffer;
  mimeType: string;
  size: number;
};

export class FileMediaInput {
  @IsString()
  @IsNotEmpty()
  rawName: string;

  @IsInstance(Buffer)
  @IsNotEmpty()
  data: Buffer;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsInt()
  @IsNotEmpty()
  size: number;

  constructor(props: FileMediaInputConstructorProps) {
    if (!props) return;

    this.rawName = props.rawName;
    this.data = props.data;
    this.mimeType = props.mimeType;
    this.size = props.size;
  }
}

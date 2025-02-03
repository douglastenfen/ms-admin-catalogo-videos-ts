import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { VideoModel } from './video.model';

export enum AudioVideoMediaRelatedField {
  TRAILER = 'trailer',
  VIDEO = 'video',
}

export type AudioVideoMediaModelProps = {
  audioVideoMediaId: string;
  name: string;
  rawLocation: string;
  encodedLocation: string | null;
  status: AudioVideoMediaStatus;
  videoId: string;
  videoRelatedField: AudioVideoMediaRelatedField;
};

@Table({
  tableName: 'audio_video_medias',
  timestamps: false,
  indexes: [{ fields: ['video_id', 'video_related_field'], unique: true }],
})
export class AudioVideoMediaModel extends Model<AudioVideoMediaModelProps> {
  @PrimaryKey
  @Column({
    field: 'audio_video_media_id',
    type: DataType.UUID,
    defaultValue: () => new Uuid().id,
  })
  declare audioVideoMediaId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({
    field: 'raw_location',
    allowNull: false,
    type: DataType.STRING(255),
  })
  declare rawLocation: string;

  @Column({
    field: 'encoded_location',
    allowNull: true,
    type: DataType.STRING(255),
  })
  declare encodedLocation: string | null;

  @Column({
    allowNull: false,
    type: DataType.ENUM(
      AudioVideoMediaStatus.PENDING,
      AudioVideoMediaStatus.PROCESSING,
      AudioVideoMediaStatus.COMPLETED,
      AudioVideoMediaStatus.FAILED,
    ),
  })
  declare status: AudioVideoMediaStatus;

  @ForeignKey(() => VideoModel)
  @Column({ field: 'video_id', allowNull: false, type: DataType.UUID })
  declare videoId: string;

  @Column({
    field: 'video_related_field',
    allowNull: false,
    type: DataType.STRING(20),
  })
  declare videoRelatedField: AudioVideoMediaRelatedField;
}

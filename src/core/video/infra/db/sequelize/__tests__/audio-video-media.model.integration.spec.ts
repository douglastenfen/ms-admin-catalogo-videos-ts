import { DataType } from 'sequelize-typescript';
import { AudioVideoMediaModel } from '../audio-video-media.model';
import { setupSequelizeForVideo } from '../testing/helper';
import { AudioVideoMediaStatus } from '../../../../../shared/domain/value-objects/audio-video-media.vo';

describe('AudioVideoMediaModel Unit Tests', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(AudioVideoMediaModel.tableName).toBe('audio_video_medias');
  });

  test('mapping props', () => {
    const uniqueIndex = AudioVideoMediaModel.options.indexes![0];
    expect(uniqueIndex).toMatchObject({
      fields: ['video_id', 'video_related_field'],
      unique: true,
    });

    const attributesMap = AudioVideoMediaModel.getAttributes();
    const attributes = Object.keys(AudioVideoMediaModel.getAttributes());
    expect(attributes).toStrictEqual([
      'audioVideoMediaId',
      'name',
      'rawLocation',
      'encodedLocation',
      'status',
      'videoId',
      'videoRelatedField',
    ]);

    const imageMediaIdAttr = attributesMap.audioVideoMediaId;
    expect(imageMediaIdAttr).toMatchObject({
      field: 'audio_video_media_id',
      fieldName: 'audioVideoMediaId',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameAttr = attributesMap.name;
    expect(nameAttr).toMatchObject({
      field: 'name',
      fieldName: 'name',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const rawLocationAttr = attributesMap.rawLocation;
    expect(rawLocationAttr).toMatchObject({
      field: 'raw_location',
      fieldName: 'rawLocation',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const encodedLocationAttr = attributesMap.encodedLocation;
    expect(encodedLocationAttr).toMatchObject({
      field: 'encoded_location',
      fieldName: 'encodedLocation',
      allowNull: true,
      type: DataType.STRING(255),
    });

    const statusAttr = attributesMap.status;
    expect(statusAttr).toMatchObject({
      field: 'status',
      fieldName: 'status',
      allowNull: false,
      type: DataType.ENUM(
        AudioVideoMediaStatus.PENDING,
        AudioVideoMediaStatus.PROCESSING,
        AudioVideoMediaStatus.COMPLETED,
        AudioVideoMediaStatus.FAILED,
      ),
    });

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      allowNull: false,
      type: DataType.UUID(),
      references: {
        model: 'videos',
        key: 'video_id',
      },
    });

    const videoRelatedFieldAttr = attributesMap.videoRelatedField;
    expect(videoRelatedFieldAttr).toMatchObject({
      field: 'video_related_field',
      fieldName: 'videoRelatedField',
      allowNull: false,
      type: DataType.STRING(20),
    });
  });
});

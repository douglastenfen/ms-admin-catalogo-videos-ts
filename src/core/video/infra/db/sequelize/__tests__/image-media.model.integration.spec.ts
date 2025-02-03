import { DataType } from 'sequelize-typescript';
import { ImageMediaModel } from '../image-media.model';
import { setupSequelizeForVideo } from '../testing/helper';

describe('ImageMediaModel Unit Tests', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(ImageMediaModel.tableName).toBe('image_medias');
  });

  test('mapping props', () => {
    const uniqueIndex = ImageMediaModel.options.indexes![0];
    expect(uniqueIndex).toMatchObject({
      fields: ['video_id', 'video_related_field'],
      unique: true,
    });

    const attributesMap = ImageMediaModel.getAttributes();
    const attributes = Object.keys(ImageMediaModel.getAttributes());
    expect(attributes).toStrictEqual([
      'imageMediaId',
      'name',
      'location',
      'videoId',
      'videoRelatedField',
    ]);

    const imageMediaIdAttr = attributesMap.imageMediaId;
    expect(imageMediaIdAttr).toMatchObject({
      field: 'image_media_id',
      fieldName: 'imageMediaId',
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

    const locationAttr = attributesMap.location;
    expect(locationAttr).toMatchObject({
      field: 'location',
      fieldName: 'location',
      allowNull: false,
      type: DataType.STRING(255),
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

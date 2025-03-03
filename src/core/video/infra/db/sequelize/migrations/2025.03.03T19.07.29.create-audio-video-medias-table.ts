import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('audio_video_medias', {
    audio_video_media_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    raw_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    encoded_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AudioVideoMediaStatus)),
      allowNull: false,
    },
    video_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    video_related_field: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addConstraint('audio_video_medias', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'audio_video_medias_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('audio_video_medias', 'audio_video_medias_video_id');

  await sequelize.getQueryInterface().dropTable('audio_video_medias');
};

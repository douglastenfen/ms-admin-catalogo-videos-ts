import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('genres_categories', {
    genre_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  });

  await sequelize.getQueryInterface().addConstraint('genres_categories', {
    fields: ['genre_id'],
    type: 'foreign key',
    name: 'genres_categories_genre_id',
    references: {
      table: 'genres',
      field: 'genre_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('genres_categories', {
    fields: ['category_id'],
    type: 'foreign key',
    name: 'genres_categories_category_id',
    references: {
      table: 'categories',
      field: 'category_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('genres_categories', 'genres_categories_genre_id');

  await sequelize
    .getQueryInterface()
    .removeConstraint('genres_categories', 'genres_categories_category_id');

  await sequelize.getQueryInterface().dropTable('genres_categories');
};

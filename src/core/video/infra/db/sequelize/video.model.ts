import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { RatingValues } from '@core/video/domain/rating.vo';
import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ImageMediaModel } from './image-media.model';
import { AudioVideoMediaModel } from './audio-video-media.model';

export type VideoModelProps = {
  videoId: string;
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  rating: RatingValues;
  isOpened: boolean;
  isPublished: boolean;
  imageMedias: ImageMediaModel[];
  audioVideoMedias: AudioVideoMediaModel[];
  categoriesId: VideoCategoryModel[];
  categories: CategoryModel[];
  genresId: VideoGenreModel[];
  genres: GenreModel[];
  castMembersId: VideoCastMemberModel[];
  castMembers: CastMemberModel[];
  createdAt: Date;
};

@Table({ tableName: 'videos', timestamps: false })
export class VideoModel extends Model<VideoModelProps> {
  @PrimaryKey
  @Column({ field: 'video_id', type: DataType.UUID })
  declare videoId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare title: string;

  @Column({ allowNull: false, type: DataType.TEXT })
  declare description: string;

  @Column({ field: 'released_year', allowNull: false, type: DataType.SMALLINT })
  declare releasedYear: number;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare duration: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM(
      RatingValues.RL,
      RatingValues.R10,
      RatingValues.R12,
      RatingValues.R14,
      RatingValues.R16,
      RatingValues.R18,
    ),
  })
  declare rating: RatingValues;

  @Column({ field: 'is_opened', allowNull: false, type: DataType.BOOLEAN })
  declare isOpened: boolean;

  @Column({ field: 'is_published', allowNull: false, type: DataType.BOOLEAN })
  declare isPublished: boolean;

  @HasMany(() => ImageMediaModel, 'videoId')
  declare imageMedias: ImageMediaModel[];

  @HasMany(() => AudioVideoMediaModel, 'videoId')
  declare audioVideoMedias: AudioVideoMediaModel[];

  @HasMany(() => VideoCategoryModel, 'videoId')
  declare categoriesId: VideoCategoryModel[];

  @BelongsToMany(() => CategoryModel, () => VideoCategoryModel)
  declare categories: CategoryModel[];

  @HasMany(() => VideoGenreModel, 'videoId')
  declare genresId: VideoGenreModel[];

  @BelongsToMany(() => GenreModel, () => VideoGenreModel)
  declare genres: GenreModel[];

  @HasMany(() => VideoCastMemberModel, 'videoId')
  declare castMembersId: VideoCastMemberModel[];

  @BelongsToMany(() => CastMemberModel, () => VideoCastMemberModel)
  declare castMembers: CastMemberModel[];

  @Column({ field: 'created_at', allowNull: false, type: DataType.DATE(6) })
  declare createdAt: Date;
}

export type VideoCategoryModelProps = {
  videoId: string;
  categoryId: string;
};

@Table({ tableName: 'category_video', timestamps: false })
export class VideoCategoryModel extends Model<VideoCategoryModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ field: 'video_id', type: DataType.UUID })
  declare videoId: string;

  @PrimaryKey
  @ForeignKey(() => CategoryModel)
  @Column({ field: 'category_id', type: DataType.UUID })
  declare categoryId: string;
}

export type VideoGenreModelProps = {
  videoId: string;
  genreId: string;
};

@Table({ tableName: 'genre_video', timestamps: false })
export class VideoGenreModel extends Model<VideoGenreModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ field: 'video_id', type: DataType.UUID })
  declare videoId: string;

  @PrimaryKey
  @ForeignKey(() => GenreModel)
  @Column({ field: 'genre_id', type: DataType.UUID })
  declare genreId: string;
}

export type VideoCastMemberModelProps = {
  videoId: string;
  castMemberId: string;
};

@Table({ tableName: 'cast_member_video', timestamps: false })
export class VideoCastMemberModel extends Model<VideoCastMemberModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ field: 'video_id', type: DataType.UUID })
  declare videoId: string;

  @PrimaryKey
  @ForeignKey(() => CastMemberModel)
  @Column({ field: 'cast_member_id', type: DataType.UUID })
  declare castMemberId: string;
}

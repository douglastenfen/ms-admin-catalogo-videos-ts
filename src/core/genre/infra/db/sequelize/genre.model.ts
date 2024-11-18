import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
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

export type GenreModelProps = {
  genreId: string;
  name: string;
  categoriesId?: GenreCategoryModel[];
  categories?: CategoryModel[];
  isActive: boolean;
  createdAt: Date;
};

@Table({ tableName: 'genres', timestamps: false })
export class GenreModel extends Model<GenreModelProps> {
  @PrimaryKey
  @Column({ field: 'genre_id', type: DataType.UUID })
  declare genreId: string;

  @Column({ type: DataType.STRING })
  declare name: string;

  @HasMany(() => GenreCategoryModel, 'genreId')
  declare categoriesId: GenreCategoryModel[];

  @BelongsToMany(() => CategoryModel, () => GenreCategoryModel)
  declare categories: CategoryModel[];

  @Column({ field: 'is_active', type: DataType.BOOLEAN })
  declare isActive: boolean;

  @Column({ field: 'created_at', type: DataType.DATE(3) })
  declare createdAt: Date;
}

export type GenreCategoryModelProps = {
  genreId: string;
  categoryId: string;
};

@Table({ tableName: 'genres_categories', timestamps: false })
export class GenreCategoryModel extends Model<GenreCategoryModelProps> {
  @PrimaryKey
  @ForeignKey(() => GenreModel)
  @Column({ field: 'genre_id', type: DataType.UUID })
  declare genreId: string;

  @PrimaryKey
  @ForeignKey(() => CategoryModel)
  @Column({ field: 'category_id', type: DataType.UUID })
  declare categoryId: string;
}

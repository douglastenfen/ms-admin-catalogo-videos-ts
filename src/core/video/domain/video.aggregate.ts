import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '@core/shared/domain/value-object';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

export type VideoConstructorProps = {
  videoId?: VideoId;
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  isOpened: boolean;
  isPublished: boolean;
  categoriesId: Map<string, CategoryId>;
  genresId: Map<string, GenreId>;
  castMembersId: Map<string, CastMemberId>;
  createdAt?: Date;
};

export type VideoCreateCommand = {
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  isOpened: boolean;
  isPublished: boolean;
  categoriesId: CategoryId[];
  genresId: GenreId[];
  castMembersId: CastMemberId[];
};

export class VideoId extends Uuid {}

export class Video extends AggregateRoot {
  videoId: VideoId;
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  isOpened: boolean;
  isPublished: boolean;
  categoriesId: Map<string, CategoryId>;
  genresId: Map<string, GenreId>;
  castMembersId: Map<string, CastMemberId>;
  createdAt: Date;

  constructor(props: VideoConstructorProps) {
    super();
    this.videoId = props.videoId ?? new VideoId();
    this.title = props.title;
    this.description = props.description;
    this.releasedYear = props.releasedYear;
    this.duration = props.duration;
    this.isOpened = props.isOpened;
    this.isPublished = props.isPublished;
    this.categoriesId = props.categoriesId;
    this.genresId = props.genresId;
    this.castMembersId = props.castMembersId;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: VideoCreateCommand) {
    const video = new Video({
      ...props,
      categoriesId: new Map(
        props.categoriesId.map((id) => [id.toString(), id]),
      ),
      genresId: new Map(props.genresId.map((id) => [id.toString(), id])),
      castMembersId: new Map(
        props.castMembersId.map((id) => [id.toString(), id]),
      ),
      isPublished: false,
    });

    return video;
  }

  changeTitle(title: string) {
    this.title = title;
  }

  changeDescription(description: string) {
    this.description = description;
  }

  changeReleasedYear(releasedYear: number) {
    this.releasedYear = releasedYear;
  }

  changeDuration(duration: number) {
    this.duration = duration;
  }

  markAsOpened() {
    this.isOpened = true;
  }

  markAsClosed() {
    this.isOpened = false;
  }

  addCategoryId(categoryId: CategoryId) {
    this.categoriesId.set(categoryId.id, categoryId);
  }

  removeCategoryId(categoryId: CategoryId) {
    this.categoriesId.delete(categoryId.id);
  }

  syncCategoriesId(categoriesId: CategoryId[]) {
    if (!categoriesId.length) {
      throw new Error('Categories id is empty');
    }

    this.categoriesId = new Map(categoriesId.map((id) => [id.id, id]));
  }

  addGenreId(genreId: GenreId) {
    this.genresId.set(genreId.id, genreId);
  }

  removeGenreId(genreId: GenreId) {
    this.genresId.delete(genreId.id);
  }

  syncGenresId(genresId: GenreId[]) {
    if (!genresId.length) {
      throw new Error('Genres id is empty');
    }

    this.genresId = new Map(genresId.map((id) => [id.id, id]));
  }

  addCastMemberId(castMemberId: CastMemberId) {
    this.castMembersId.set(castMemberId.id, castMemberId);
  }

  removeCastMemberId(castMemberId: CastMemberId) {
    this.castMembersId.delete(castMemberId.id);
  }

  syncCastMembersId(castMembersId: CastMemberId[]) {
    if (!castMembersId.length) {
      throw new Error('Cast members id is empty');
    }

    this.castMembersId = new Map(castMembersId.map((id) => [id.id, id]));
  }

  get entityId(): ValueObject {
    return this.videoId;
  }

  toJSON() {
    return {
      videoId: this.videoId.id,
      title: this.title,
      description: this.description,
      releasedYear: this.releasedYear,
      duration: this.duration,
      isOpened: this.isOpened,
      isPublished: this.isPublished,
      categoriesId: Array.from(this.categoriesId.values()).map((id) => id.id),
      genresId: Array.from(this.genresId.values()).map((id) => id.id),
      castMembersId: Array.from(this.castMembersId.values()).map((id) => id.id),
      createdAt: this.createdAt,
    };
  }
}

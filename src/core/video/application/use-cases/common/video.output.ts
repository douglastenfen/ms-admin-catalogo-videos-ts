import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { RatingValues } from '@core/video/domain/rating.vo';
import { Video } from '@core/video/domain/video.aggregate';

export type VideoCategoryOutput = {
  id: string;
  name: string;
  createdAt: Date;
};

export type VideoGenreOutput = {
  id: string;
  name: string;
  isActive: boolean;
  categoriesId: string[];
  categories: VideoCategoryOutput[];
  createdAt: Date;
};

export type VideoCastMemberOutput = {
  id: string;
  name: string;
  type: CastMemberTypes;
  createdAt: Date;
};

export type VideoOutput = {
  id: string;
  title: string;
  description: string;
  releasedYear: number;
  duration: number;
  rating: RatingValues;
  isOpened: boolean;
  isPublished: boolean;
  categoriesId: string[];
  categories: VideoCategoryOutput[];
  genresId: string[];
  genres: VideoGenreOutput[];
  castMembersId: string[];
  castMembers: VideoCastMemberOutput[];
  createdAt: Date;
};

export type VideoOutputParams = {
  video: Video;
  allCategoriesOfVideoAndGenre: Category[];
  genres: Genre[];
  castMembers: CastMember[];
};

export class VideoOutputMapper {
  static toOutput({
    video,
    allCategoriesOfVideoAndGenre,
    genres,
    castMembers,
  }: VideoOutputParams): VideoOutput {
    return {
      id: video.videoId.id,
      title: video.title,
      description: video.description,
      releasedYear: video.releasedYear,
      duration: video.duration,
      rating: video.rating.value,
      isOpened: video.isOpened,
      isPublished: video.isPublished,
      categoriesId: Array.from(video.categoriesId.values()).map((c) => c.id),
      categories: allCategoriesOfVideoAndGenre
        .filter((c) => video.categoriesId.has(c.categoryID.id))
        .map((c) => ({
          id: c.categoryID.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
      genresId: Array.from(video.genresId.values()).map((g) => g.id),
      genres: VideoOutputMapper.toGenreVideoOutput(
        video,
        genres,
        allCategoriesOfVideoAndGenre,
      ),
      castMembersId: Array.from(video.castMembersId.values()).map((c) => c.id),
      castMembers: castMembers
        .filter((c) => video.castMembersId.has(c.castMemberId.id))
        .map((c) => ({
          id: c.castMemberId.id,
          name: c.name,
          type: c.type.type,
          createdAt: c.createdAt,
        })),
      createdAt: video.createdAt,
    };
  }

  private static toGenreVideoOutput(
    video: Video,
    genres: Genre[],
    categories: Category[],
  ) {
    return genres
      .filter((g) => video.genresId.has(g.genreId.id))
      .map((g) => ({
        id: g.genreId.id,
        name: g.name,
        isActive: g.isActive,
        categoriesId: Array.from(g.categoriesId.values()).map((c) => c.id),
        categories: categories
          .filter((c) => g.categoriesId.has(c.categoryID.id))
          .map((c) => ({
            id: c.categoryID.id,
            name: c.name,
            createdAt: c.createdAt,
          })),
        createdAt: g.createdAt,
      }));
  }
}

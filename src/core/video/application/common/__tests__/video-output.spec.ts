import { Video } from '@core/video/domain/video.aggregate';
import { VideoOutputMapper } from '../video-output';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';

describe('VideoOutputMapper Unit Tests', () => {
  describe('genreOutput method', () => {
    it('should return an empty array if no genres match', () => {
      const video = Video.fake().aVideoWithAllMedias().build();

      const output = VideoOutputMapper['toGenreVideoOutput'](video, [], []);

      expect(output).toEqual([]);
    });

    it('should return an array of genres that match the video', () => {
      const categories = Category.fake().theCategories(2).build();

      const genres = Genre.fake().theGenres(2).build();
      genres[0].syncCategoriesId([categories[0].categoryID]);
      genres[1].syncCategoriesId([categories[1].categoryID]);

      const video = Video.fake()
        .aVideoWithAllMedias()
        .addGenreId(genres[0].genreId)
        .addGenreId(genres[1].genreId)
        .build();

      const output = VideoOutputMapper['toGenreVideoOutput'](
        video,
        genres,
        categories,
      );

      expect(output).toEqual([
        {
          id: genres[0].genreId.toString(),
          name: genres[0].name,
          isActive: genres[0].isActive,
          categoriesId: [categories[0].categoryID.id],
          categories: [
            {
              id: categories[0].categoryID.id,
              name: categories[0].name,
              createdAt: categories[0].createdAt,
            },
          ],
          createdAt: genres[0].createdAt,
        },
        {
          id: genres[1].genreId.id,
          name: genres[1].name,
          isActive: genres[1].isActive,
          categoriesId: [categories[1].categoryID.id],
          categories: [
            {
              id: categories[1].categoryID.id,
              name: categories[1].name,
              createdAt: categories[1].createdAt,
            },
          ],
          createdAt: genres[1].createdAt,
        },
      ]);
    });

    it('should convert a video in output', () => {
      const categories = Category.fake().theCategories(2).build();

      const genres = Genre.fake().theGenres(2).build();
      genres[0].syncCategoriesId([categories[0].categoryID]);
      genres[1].syncCategoriesId([categories[1].categoryID]);

      const castMembers = CastMember.fake().theCastMembers(2).build();

      const entity = Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(categories[0].categoryID)
        .addCategoryId(categories[1].categoryID)
        .addGenreId(genres[0].genreId)
        .addGenreId(genres[1].genreId)
        .addCastMemberId(castMembers[0].castMemberId)
        .addCastMemberId(castMembers[1].castMemberId)
        .build();

      const output = VideoOutputMapper.toOutput({
        video: entity,
        genres,
        castMembers,
        allCategoriesOfVideoAndGenre: categories,
      });

      expect(output).toEqual({
        id: entity.videoId.id,
        title: entity.title,
        description: entity.description,
        releasedYear: entity.releasedYear,
        duration: entity.duration,
        rating: entity.rating.value,
        isOpened: entity.isOpened,
        isPublished: entity.isPublished,
        categoriesId: [
          categories[0].categoryID.id,
          categories[1].categoryID.id,
        ],
        categories: [
          {
            id: categories[0].categoryID.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt,
          },
          {
            id: categories[1].categoryID.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt,
          },
        ],
        genresId: [genres[0].genreId.id, genres[1].genreId.id],
        genres: [
          {
            id: genres[0].genreId.id,
            name: genres[0].name,
            isActive: genres[0].isActive,
            categoriesId: [categories[0].categoryID.id],
            categories: [
              {
                id: categories[0].categoryID.id,
                name: categories[0].name,
                createdAt: categories[0].createdAt,
              },
            ],
            createdAt: genres[0].createdAt,
          },
          {
            id: genres[1].genreId.id,
            name: genres[1].name,
            isActive: genres[1].isActive,
            categoriesId: [categories[1].categoryID.id],
            categories: [
              {
                id: categories[1].categoryID.id,
                name: categories[1].name,
                createdAt: categories[1].createdAt,
              },
            ],
            createdAt: genres[1].createdAt,
          },
        ],
        castMembersId: [
          castMembers[0].castMemberId.id,
          castMembers[1].castMemberId.id,
        ],
        castMembers: [
          {
            id: castMembers[0].castMemberId.id,
            name: castMembers[0].name,
            type: castMembers[0].type.type,
            createdAt: castMembers[0].createdAt,
          },
          {
            id: castMembers[1].castMemberId.id,
            name: castMembers[1].name,
            type: castMembers[1].type.type,
            createdAt: castMembers[1].createdAt,
          },
        ],
        createdAt: entity.createdAt,
      });
    });
  });
});

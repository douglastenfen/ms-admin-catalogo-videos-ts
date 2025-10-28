import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Video } from '@core/video/domain/video.aggregate';

const _keysInResponse = [
  'videoId',
  'title',
  'description',
  'releasedYear',
  'duration',
  'rating',
  'isOpened',
  'isPublished',
  'banner',
  'thumbnail',
  'thumbnailHalf',
  'trailer',
  'video',
  'categoriesId',
  'genresId',
  'castMembersId',
  'createdAt',
];

export class GetVideoFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateVideoFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForCreate() {
    const categories = Category.fake().theCategories(2).build();

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].categoryID]);
    genres[1].syncCategoriesId([categories[1].categoryID]);

    const castMembers = CastMember.fake().theCastMembers(2).build();

    const faker = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(categories[0].categoryID)
      .addCategoryId(categories[1].categoryID)
      .addGenreId(genres[0].genreId)
      .addGenreId(genres[1].genreId)
      .addCastMemberId(castMembers[0].castMemberId)
      .addCastMemberId(castMembers[1].castMemberId);

    return [
      {
        sendData: {
          title: faker.title,
          description: faker.description,
          releasedYear: faker.releasedYear,
          duration: faker.duration,
          rating: faker.rating.value,
          isOpened: true,
          categoriesId: [categories[0].categoryID.id],
          genresId: [genres[0].genreId.id],
          castMembersId: [castMembers[0].castMemberId.id],
        },
        expected: {
          title: faker.title,
          description: faker.description,
          releasedYear: faker.releasedYear,
          duration: faker.duration,
          rating: faker.rating.value,
          isOpened: true,
          isPublished: false,
          banner: null,
          thumbnail: null,
          thumbnailHalf: null,
          trailer: null,
          video: null,
          categoriesId: [categories[0].categoryID],
          genresId: [genres[0].genreId],
          castMembersId: [castMembers[0].castMemberId],
          createdAt: faker.createdAt,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };
  }
}

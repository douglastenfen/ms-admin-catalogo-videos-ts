import { CategoryId } from '@core/category/domain/category.aggregate';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from './video.model';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { Notification } from '@core/shared/domain/validators/notification';
import { Banner } from '@core/video/domain/banner.vo';
import { Thumbnail } from '@core/video/domain/thumbnail.vo';
import { ThumbnailHalf } from '@core/video/domain/thumbnail-half.vo';
import { Rating } from '@core/video/domain/rating.vo';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { VideoMedia } from '@core/video/domain/video-media.vo';
import { Trailer } from '@core/video/domain/trailer.vo';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import {
  ImageMediaModel,
  ImageMediaVideoRelatedField,
} from './image-media.model';
import { AudioVideoMedia } from '@core/shared/domain/value-objects/audio-video-media.vo';
import {
  AudioVideoMediaModel,
  AudioVideoMediaRelatedField,
} from './audio-video-media.model';

export class VideoModelMapper {
  static toEntity(model: VideoModel) {
    const {
      videoId: id,
      categoriesId = [],
      genresId = [],
      castMembersId = [],
      imageMedias = [],
      audioVideoMedias = [],
      ...otherData
    } = model.toJSON();

    const categoriesIds = categoriesId.map((c) => new CategoryId(c.categoryId));
    const genresIds = genresId.map((g) => new GenreId(g.genreId));
    const castMembersIds = castMembersId.map(
      (c) => new CastMemberId(c.castMemberId),
    );

    const notification = new Notification();

    if (!categoriesIds.length) {
      notification.addError('categoriesId should not be empty', 'categoriesId');
    }

    if (!genresIds.length) {
      notification.addError('genresId should not be empty', 'genresId');
    }

    if (!castMembersIds.length) {
      notification.addError(
        'castMembersId should not be empty',
        'castMembersId',
      );
    }

    const bannerModel = imageMedias.find(
      (i) => i.videoRelatedField === 'banner',
    );
    const banner = bannerModel
      ? new Banner({ name: bannerModel.name, location: bannerModel.location })
      : null;

    const thumbnailModel = imageMedias.find(
      (i) => i.videoRelatedField === 'thumbnail',
    );
    const thumbnail = thumbnailModel
      ? new Thumbnail({
          name: thumbnailModel.name,
          location: thumbnailModel.location,
        })
      : null;

    const thumbnailHalfModel = imageMedias.find(
      (i) => i.videoRelatedField === 'thumbnail_half',
    );
    const thumbnailHalf = thumbnailHalfModel
      ? new ThumbnailHalf({
          name: thumbnailHalfModel.name,
          location: thumbnailHalfModel.location,
        })
      : null;

    const trailerModel = audioVideoMedias.find(
      (a) => a.videoRelatedField === 'trailer',
    );
    const trailer = trailerModel
      ? new Trailer({
          name: trailerModel.name,
          rawLocation: trailerModel.rawLocation,
          encodedLocation: trailerModel.encodedLocation!,
          status: trailerModel.status,
        })
      : null;

    const videoModel = audioVideoMedias.find(
      (a) => a.videoRelatedField === 'video',
    );
    const videoMedia = videoModel
      ? new VideoMedia({
          name: videoModel.name,
          rawLocation: videoModel.rawLocation,
          encodedLocation: videoModel.encodedLocation!,
          status: videoModel.status,
        })
      : null;

    const [rating, errorRating] = Rating.create(otherData.rating).asArray();

    if (errorRating) {
      notification.addError(errorRating.message, 'rating');
    }

    const videoEntity = new Video({
      ...otherData,
      rating,
      videoId: new VideoId(id),
      banner,
      thumbnail,
      thumbnailHalf,
      trailer,
      video: videoMedia,
      categoriesId: new Map(categoriesIds.map((c) => [c.id, c])),
      genresId: new Map(genresIds.map((g) => [g.id, g])),
      castMembersId: new Map(castMembersIds.map((c) => [c.id, c])),
    });

    videoEntity.validate();

    notification.copyErrors(videoEntity.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return videoEntity;
  }

  static toModelProps(entity: Video) {
    const {
      banner,
      thumbnail,
      thumbnailHalf,
      trailer,
      video,
      categoriesId,
      genresId,
      castMembersId,
      ...otherData
    } = entity.toJSON();

    return {
      ...otherData,
      imageMedias: [
        {
          media: banner,
          videoRelatedField: ImageMediaVideoRelatedField.BANNER,
        },
        {
          media: thumbnail,
          videoRelatedField: ImageMediaVideoRelatedField.THUMBNAIL,
        },
        {
          media: thumbnailHalf,
          videoRelatedField: ImageMediaVideoRelatedField.THUMBNAIL_HALF,
        },
      ]
        .map((item) => {
          return item.media
            ? ImageMediaModel.build({
                videoId: entity.videoId.id,
                name: item.media.name,
                location: item.media.location,
                videoRelatedField: item.videoRelatedField as any,
              } as any)
            : null;
        })
        .filter(Boolean) as ImageMediaModel[],

      audioVideoMedias: [trailer, video]
        .map((audioVideoMedia, index) => {
          return audioVideoMedia
            ? AudioVideoMediaModel.build({
                videoId: entity.videoId.id,
                name: audioVideoMedia.name,
                rawLocation: audioVideoMedia.rawLocation,
                encodedLocation: audioVideoMedia.encodedLocation,
                status: audioVideoMedia.status,
                videoRelatedField:
                  index === 0
                    ? AudioVideoMediaRelatedField.TRAILER
                    : AudioVideoMediaRelatedField.VIDEO,
              } as any)
            : null;
        })
        .filter(Boolean) as AudioVideoMediaModel[],
      categoriesId: categoriesId.map((categoryId) =>
        VideoCategoryModel.build({
          videoId: entity.videoId.id,
          categoryId: categoryId,
        }),
      ),
      genresId: genresId.map((genreId) =>
        VideoGenreModel.build({
          videoId: entity.videoId.id,
          genreId: genreId,
        }),
      ),
      castMembersId: castMembersId.map((castMemberId) =>
        VideoCastMemberModel.build({
          videoId: entity.videoId.id,
          castMemberId: castMemberId,
        }),
      ),
    };
  }
}

import { SequelizeOptions } from 'sequelize-typescript';

import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../../../../genre/infra/db/sequelize/genre.model';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize-helper';
import { AudioVideoMediaModel } from '../audio-video-media.model';
import { ImageMediaModel } from '../image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../video.model';

export function setupSequelizeForVideo(options: SequelizeOptions = {}) {
  return setupSequelize({
    models: [
      ImageMediaModel,
      VideoModel,
      AudioVideoMediaModel,
      VideoCategoryModel,
      CategoryModel,
      VideoGenreModel,
      GenreModel,
      GenreCategoryModel,
      VideoCastMemberModel,
      CastMemberModel,
    ],
    ...options,
  });
}

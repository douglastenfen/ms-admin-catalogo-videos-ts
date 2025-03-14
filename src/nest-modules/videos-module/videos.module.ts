import { AudioVideoMediaModel } from '@core/video/infra/db/sequelize/audio-video-media.model';
import { ImageMediaModel } from '@core/video/infra/db/sequelize/image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '@core/video/infra/db/sequelize/video.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CastMembersModule } from '../cast-members-module/cast-members.module';
import { CategoriesModule } from '../categories-module/categories.module';
import { GenresModule } from '../genres-module/genres.module';
import { VideosController } from './videos.controller';
import { VIDEOS_PROVIDERS } from './videos.provider';
import { RabbitmqModule } from '../rabbitmq-module/rabbitmq.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VideoModel,
      VideoCategoryModel,
      VideoGenreModel,
      VideoCastMemberModel,
      ImageMediaModel,
      AudioVideoMediaModel,
    ]),
    RabbitmqModule.forFeature(),
    CategoriesModule,
    GenresModule,
    CastMembersModule,
  ],
  controllers: [VideosController],
  providers: [
    ...Object.values(VIDEOS_PROVIDERS.REPOSITORIES),
    ...Object.values(VIDEOS_PROVIDERS.USE_CASES),
    ...Object.values(VIDEOS_PROVIDERS.HANDLERS),
  ],
})
export class VideosModule {}

import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { AudioVideoMediaModel } from '@core/video/infra/db/sequelize/audio-video-media.model';
import { ImageMediaModel } from '@core/video/infra/db/sequelize/image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '@core/video/infra/db/sequelize/video.model';
import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config-module/config.module';
import { CategoryModel } from '../../core/category/infra/db/sequelize/category.model';

const models = [
  CategoryModel,
  GenreModel,
  GenreCategoryModel,
  CastMemberModel,
  VideoModel,
  VideoCategoryModel,
  VideoCastMemberModel,
  VideoGenreModel,
  ImageMediaModel,
  AudioVideoMediaModel,
];

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get('DB_VENDOR');

        if (dbVendor === 'sqlite') {
          return {
            dialect: 'sqlite',
            host: configService.get('DB_HOST'),
            models,
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }

        if (dbVendor === 'mysql') {
          return {
            dialect: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            database: configService.get('DB_DATABASE'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            models,
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }

        throw new Error(`Unsupported database configuration: ${dbVendor}`);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: UnitOfWorkSequelize,
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      inject: [getConnectionToken()],
      scope: Scope.REQUEST,
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
    },
  ],
  exports: ['UnitOfWork'],
})
export class DatabaseModule {}

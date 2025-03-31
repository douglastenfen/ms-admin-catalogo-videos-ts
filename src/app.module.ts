import { Module } from '@nestjs/common';

import { AuthModule } from './nest-modules/auth-module/auth.module';
import { CastMembersModule } from './nest-modules/cast-members-module/cast-members.module';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { EventModule } from './nest-modules/event-module/event.module';
import { GenresModule } from './nest-modules/genres-module/genres.module';
import { RabbitmqModule } from './nest-modules/rabbitmq-module/rabbitmq.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { UseCaseModule } from './nest-modules/use-case-module/use-case.module';
import { VideosModule } from './nest-modules/videos-module/videos.module';
import { RabbitMQFakeConsumer } from './rabbitmq-fake.consumer';
import { RabbitmqFakeController } from './rabbitmq-fake/rabbitmq-fake.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SharedModule,
    DatabaseModule,
    EventModule,
    UseCaseModule,
    RabbitmqModule.forRoot(),
    AuthModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
  ],
  providers: [RabbitMQFakeConsumer],
  controllers: [RabbitmqFakeController],
})
export class AppModule {}

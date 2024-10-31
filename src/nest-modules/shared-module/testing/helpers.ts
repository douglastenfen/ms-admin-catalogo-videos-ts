import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from 'src/app.module';
import { applyGlobalConfig } from 'src/nest-modules/global-config';

export function startApp() {
  let _app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const sequelize = moduleFixture.get<Sequelize>(getConnectionToken());

    await sequelize.sync({ force: true });

    _app = moduleFixture.createNestApplication();

    applyGlobalConfig(_app);

    await _app.init();
  });

  afterEach(async () => {
    await _app?.close();
  });

  return {
    get app() {
      return _app;
    },
  };
}

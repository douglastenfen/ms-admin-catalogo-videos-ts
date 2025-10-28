import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import { CreateVideoFixture } from 'src/nest-modules/videos-module/testing/video-fixture';
import request from 'supertest';

describe('VideosController (e2e)', () => {
  describe('/videos (POST)', () => {
    describe('unaunthenticated', () => {
      const app = startApp();

      test('return 401 when not authenticated', () => {
        return request(app.app.getHttpServer())
          .post('/videos')
          .send({})
          .expect(401);
      });

      test('return 403 when not authenticated as admin', () => {
        return request(app.app.getHttpServer())
          .post('/videos')
          .authenticate(app.app, false)
          .send({})
          .expect(403);
      });
    });
  });
});

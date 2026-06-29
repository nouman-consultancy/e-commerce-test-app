import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Auth endpoints (e2e)', () => {
  let app: INestApplication<App>;

  const unique = Date.now();
  const email = `e2e_auth_${unique}@test.com`;
  const password = 'TestPass123!';
  const name = 'E2E User';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 and an access_token for a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, password, name })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 and an access_token for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('returns 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' })
        .expect(401);
    });
  });
});

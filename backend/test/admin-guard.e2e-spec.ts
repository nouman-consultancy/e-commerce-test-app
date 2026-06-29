import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

/**
 * Requires the seed to have been run: npm run seed (in backend/)
 * Seeded admin: admin@shop.com / Admin123!
 */
describe('Admin guard (e2e)', () => {
  let app: INestApplication<App>;
  let customerToken: string;
  let adminToken: string;

  const unique = Date.now();
  const customerEmail = `e2e_cust_${unique}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // Register a fresh customer
    const customerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: customerEmail, password: 'TestPass123!', name: 'E2E Customer' });
    customerToken = customerRes.body.access_token as string;

    // Login as seeded admin
    const adminRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@shop.com', password: 'Admin123!' });
    adminToken = adminRes.body.access_token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  const nonExistentId = '00000000-0000-0000-0000-000000000000';

  it('customer JWT on DELETE /api/admin/products/:id returns 403', async () => {
    await request(app.getHttpServer())
      .delete(`/api/admin/products/${nonExistentId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  it('admin JWT on DELETE /api/admin/products/:id returns 404 (not 403)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/admin/products/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).not.toBe(403);
    // Product does not exist so service throws 404
    expect(res.status).toBe(404);
  });
});

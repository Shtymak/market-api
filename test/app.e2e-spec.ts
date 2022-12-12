import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  const http = request(app.getHttpServer());

  it('Create a new user [Unauthorized]', async () => {
    const response = await http.post('/users').send({
      email: faker.internet.email(),
      password: faker.internet.password(),
      dateOfbirth: faker.date.past(),
      name: faker.name.firstName(),
      phone: faker.phone.phoneNumber(),
    });
    const status = response.status;
    expect(status).toBe(401);
    return response;
  });
});

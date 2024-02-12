import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('create & delete user', async () => {
    const result = await request(app.getHttpServer())
      .post('/user')
      .send({
        "firstname": faker.person.firstName(),
        "lastname": faker.person.lastName(),
        "email": faker.internet.email(),
        "timezone": faker.location.timeZone(),
        "birthdate": faker.date.birthdate().toISOString().substring(0, 10),
      })
      .expect(201);

    console.log(`Created: ${JSON.stringify(result.body)}`);
    const id = result.body.id;

    const editted = await request(app.getHttpServer())
      .put(`/user/${id}`)
      .send({
        "firstname": faker.person.firstName(),
        "lastname": faker.person.lastName(),
        "email": faker.internet.email(),
        "timezone": faker.location.timeZone(),
        "birthdate": faker.date.birthdate().toISOString().substring(0, 10),
      })
      .expect(200);
    console.log(`Updated: ${JSON.stringify(editted.body)}`);


    await request(app.getHttpServer())
      .delete(`/user/${id}`)
      .expect(200);
  });

  afterEach(async () => {
    app.close();
  });
});

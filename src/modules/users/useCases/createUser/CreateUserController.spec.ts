import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create user', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create an user', async () => {
    const response = await request(app).post('/api/v1/users/').send({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
    });

    expect(response.status).toBe(201);
  });
});
import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get statement operation', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash('admin', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to get the statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@finapi.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit test',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statement.status).toBe(200);
    expect(statement.body.id).toBe(deposit.body.id);
  });

  it('Should not be able to get the statement from a non-existent id', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@finapi.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const statements = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statements.status).toBe(404);
  });
});
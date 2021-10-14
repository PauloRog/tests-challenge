import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get balance', () => {
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

  it('Should be able to get balance', async () => {
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

    const withdraw = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 50,
        description: 'Withdraw test',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const balance = await request(app)
      .get('/api/v1/statements/balance')
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(balance.status).toBe(200);
    expect(balance.body.statement[0].id).toBe(deposit.body.id);
    expect(balance.body.statement[1].id).toBe(withdraw.body.id);
  });
});
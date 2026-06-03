const request = require('supertest');
const app = require('./server');
const mongoose = require('mongoose');

describe('testing the register route', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('POST /register', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: '', password: '12345678' });

    expect(res.statusCode).toBe(400);
  });
});

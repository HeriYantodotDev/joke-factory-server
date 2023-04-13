import request from 'supertest';
import { app } from '../app';

describe('User Registration', () => {
  test('Return 200, when the sign up request is valid', async () => {
    const response = await request(app).post('/v1/users').send({
      userName: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });
    expect(response.status).toBe(200);
  });

  test('Return success message when sign up is successful', async () => {
    const response = await request(app).post('/v1/users').send({
      userName: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    const responseBody = await response.body;

    expect(responseBody).toStrictEqual({
      message: 'User is created',
    });
  });
});

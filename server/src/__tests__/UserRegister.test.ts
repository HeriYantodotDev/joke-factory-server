import request from 'supertest';
import { app } from '../app';
import { User } from '../models';
import { sequelize } from '../config/database';
import exp from 'constants';

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe('User Registration', () => {
  test('Return 200, when the sign up request is valid', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });
    expect(response.status).toBe(200);
  });

  test('Return success message when sign up is successful', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user2',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    const responseBody = await response.body;

    expect(responseBody).toStrictEqual({
      signUpStatus: 'success',
      message: 'User is created',
    });
  });

  test('Save user to the database', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user3',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    //query user table
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  test('Saves the username and email to database', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user4',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user4');
    expect(savedUser.email).toBe('user1@gmail.com');
  });

  test('Return 401, when the sign up form is invalid', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: '',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });
    expect(response.status).toBe(401);
  });

  test('Return error message when the sign up form is invalid', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: '',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });
    expect(response.body).toMatchObject({
      signUpStatus: 'failed',
    });
  });
});

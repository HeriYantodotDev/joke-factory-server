import request from 'supertest';
import { app } from '../app';
import { User } from '../models';
import { sequelize } from '../config/database';

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe('User Registration', () => {
  test('Return 200, when the sign up request is valid', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      userName: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });
    expect(response.status).toBe(200);
  });

  test('Return success message when sign up is successful', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    const responseBody = await response.body;

    expect(responseBody).toStrictEqual({
      message: 'User is created',
    });
  });

  test('Save user to the database', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    //query user table
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  test('Saves the username and email to database', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@gmail.com');
  });
});

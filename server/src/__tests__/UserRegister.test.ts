import request from 'supertest';
import { app } from '../app';
import { User } from '../models';
import { sequelize } from '../config/database';
import exp from 'constants';

const bodyWithoutUserName = {
  username: '',
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};

const bodyValid = {
  username: 'user1',
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};

const bodyWithInvalidPass = {
  username: 'useruser1',
  email: 'user1@gmail.com',
  password: 'password',
};

const bodyWithInvalidPass2 = {
  username: 'useruser1',
  email: 'user1@gmail.com',
  password: 'P@assword',
};

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe('User Registration', () => {
  test('Returns 200, when the sign up request is valid', async () => {
    const response = await request(app).post('/api/1.0/users').send(bodyValid);

    expect(response.status).toBe(200);
  });

  test('Return success message when sign up is successful', async () => {
    const response = await request(app).post('/api/1.0/users').send(bodyValid);
    const responseBody = await response.body;

    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(responseBody).toStrictEqual({
      signUpStatus: 'success',
      message: 'User is created',
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
      },
    });
  });

  test('Saves user to the database', async () => {
    const response = await request(app).post('/api/1.0/users').send(bodyValid);
    const userList = await User.findAll();

    expect(userList.length).toBe(1);
  });

  test('Saves the username and email to database', async () => {
    const response = await request(app).post('/api/1.0/users').send(bodyValid);
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@gmail.com');
  });

  test('Returns 400, when the sign up form is invalid', async () => {
    const response = await request(app)
      .post('/api/1.0/users')
      .send(bodyWithoutUserName);

    expect(response.status).toBe(400);
  });

  test('Returns error message when the sign up form is invalid', async () => {
    const response = await request(app)
      .post('/api/1.0/users')
      .send(bodyWithoutUserName);

    expect(response.body).toMatchObject({
      signUpStatus: 'failed',
    });

    expect(response.body.message !== undefined).toBe(true);
  });

  test('Returns error message when the password is invalid', async () => {
    const response = await request(app)
      .post('/api/1.0/users')
      .send(bodyWithInvalidPass);

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      signUpStatus: 'failed',
      message:
        'Password must contain at least 1 uppercase, 1 lowercase, 1 symbol, and 1 number.',
    });

    const response2 = await request(app)
      .post('/api/1.0/users')
      .send(bodyWithInvalidPass2);

    expect(response2.status).toBe(400);
    expect(response.body).toStrictEqual({
      signUpStatus: 'failed',
      message:
        'Password must contain at least 1 uppercase, 1 lowercase, 1 symbol, and 1 number.',
    });
  });

  test('hashes the password in the database', async () => {
    const response = await request(app).post('/api/1.0/users').send(bodyValid);
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(savedUser.password).not.toBe('A4GuaN@SmZ');
  });
});

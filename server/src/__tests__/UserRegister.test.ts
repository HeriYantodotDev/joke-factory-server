import request from 'supertest';
import { app } from '../app';
import { User, NewUser } from '../models';
import { sequelize } from '../config/database';

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
const userBodyValid = 'user1';
const emailBodyValid = 'user1@gmail.com';
const passBodyValid = 'A4GuaN@SmZ';

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

const signUpFailedPasswordError = {
  signUpStatus: 'failed',
  message:
    'Password must contain at least 1 uppercase, 1 lowercase, 1 symbol, and 1 number.',
};

const signUpStatusOnlyFailed = {
  signUpStatus: 'failed',
};

function generateResponseSuccessBodyValid(savedUser: User) {
  return {
    signUpStatus: 'success',
    message: 'User is created',
    user: {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
    },
  };
}

async function postValid() {
  return await request(app).post('/api/1.0/users').send(bodyValid);
}

async function postWithoutUserName() {
  return await request(app).post('/api/1.0/users').send(bodyWithoutUserName);
}

async function postInvalidPassword(bodyWithInvalidPassword: NewUser) {
  return await request(app)
    .post('/api/1.0/users')
    .send(bodyWithInvalidPassword);
}

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe('User Registration', () => {
  test('Returns 200, when the sign up request is valid', async () => {
    const response = await postValid();
    expect(response.status).toBe(200);
  });

  test('Return success message when sign up is successful', async () => {
    const response = await postValid();
    const responseBody = await response.body;

    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(responseBody).toStrictEqual(
      generateResponseSuccessBodyValid(savedUser)
    );
  });

  test('Saves user to the database', async () => {
    await postValid();
    const userList = await User.findAll();

    expect(userList.length).toBe(1);
  });

  test('Saves the username and email to database', async () => {
    await postValid();
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(savedUser.username).toBe(userBodyValid);
    expect(savedUser.email).toBe(emailBodyValid);
  });

  test('Returns 400, when the sign up form is invalid', async () => {
    const response = await postWithoutUserName();

    expect(response.status).toBe(400);
  });

  test('Returns error message when the sign up form is invalid', async () => {
    const response = await postWithoutUserName();

    expect(response.body).toMatchObject(signUpStatusOnlyFailed);

    expect(response.body.message !== undefined).toBe(true);
  });

  test('Returns error message when the password is invalid', async () => {
    const response = await postInvalidPassword(bodyWithInvalidPass);

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(signUpFailedPasswordError);

    const response2 = await postInvalidPassword(bodyWithInvalidPass2);

    expect(response2.status).toBe(400);
    expect(response.body).toStrictEqual(signUpFailedPasswordError);
  });

  test('hashes the password in the database', async () => {
    await postValid();
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(savedUser.password).not.toBe(passBodyValid);
  });
});

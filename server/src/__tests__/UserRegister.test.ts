import request from 'supertest';
import { app } from '../app';
import { User, NewUser, UserHelperModel } from '../models';
import { sequelize } from '../config/database';
import { UserHelperController } from '../controllers';
import { Response } from 'express';
import { 
  SIGNUP_STATUS, 
  ResponseUserCreatedSuccess, 
  ResponseUserCreatedFailed 
} from '../models';
import { ErrorMessageInvalidJSON } from '../utils';


interface UserModified {
  [key: string]: string | null,
  username: string,
  email: string,
  password: string,
}

const bodyValid: NewUser = {
  username: 'user1',
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};
const userBodyValid = 'user1';
const emailBodyValid = 'user1@gmail.com';
const passBodyValid = 'A4GuaN@SmZ';

const bodyValidSameEmail: NewUser = {
  username: 'userFree',
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};

const signUpFailedPasswordError: ResponseUserCreatedFailed = {
  signUpStatus: SIGNUP_STATUS.failed,
  message:
    'Password must contain at least 1 uppercase, ' + 
    '1 lowercase, 1 symbol, and 1 number.',
};

const signUpFailedPasswordLess8: ResponseUserCreatedFailed = {
  signUpStatus: SIGNUP_STATUS.failed,
  message: '"password" length must be at least 8 characters long',
};

const signUpFailedInvalidEmail: ResponseUserCreatedFailed = {
  signUpStatus: SIGNUP_STATUS.failed,
  message: '"email" must be a valid email',
};

const signUpStatusOnlyFailed = {
  signUpStatus: 'failed',
};

function generateResponseSuccessBodyValid(savedUser: User): ResponseUserCreatedSuccess {
  return {
    signUpStatus: SIGNUP_STATUS.success,
    message: 'User is created',
    user: {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
    },
  };
}

function generateResponseFailedUserExist(user: string): ResponseUserCreatedFailed {
  return {
    signUpStatus: SIGNUP_STATUS.failed,
    message: `Username: ${user} already exists`,
    validationErrors: {username: `Username: ${user} already exists`},
  };
}

function generateResponseFailedEmailExist(email: string): ResponseUserCreatedFailed {
  return {
    signUpStatus: SIGNUP_STATUS.failed,
    message: `Email: ${email} already exists`,
    validationErrors: {email: `Email: ${email} already exists`},
  };
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postUser(user: any = bodyValid) {  
  return await request(app).post('/api/1.0/users').send(user);
}

async function postInvalidJson() {
  return request(app)
  .post('/api/1.0/users')
  .set('Content-Type', 'application/json')
  .send('invalid json');
}

const errorMessageInvalidJson1: ErrorMessageInvalidJSON = {
  error: 'Invalid JSON',
  message: 'Unexpected token i in JSON at position 0',
};

describe('User Registration API', () => {
  beforeAll(() => {
    return sequelize.sync({force:true});
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    return User.destroy({ truncate: true });
  });

  test('Returns 400 & error Message, when JSON Request is invalid', async () => {
    const response = await postInvalidJson();

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(errorMessageInvalidJson1);
  });

  test('Returns 200 + success message + save to database, when the sign up request is valid', 
    async () => {
      const response = await postUser();
      const userList = await User.findAll();
      const savedUser = userList[0];

      expect(response.status).toBe(200);

      expect(response.body).toStrictEqual(
        generateResponseSuccessBodyValid(savedUser)
      );

      expect(userList.length).toBe(1);
      expect(savedUser.username).toBe(userBodyValid);
      expect(savedUser.email).toBe(emailBodyValid);
  });

  test('hashes the password in the database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(savedUser.password).not.toBe(passBodyValid);
  });

  test.each`
    field           | errorMessage
    ${'username'}   | ${'"username" is not allowed to be empty'}
    ${'email'}      | ${'"email" is not allowed to be empty'}
    ${'password'}   | ${'"password" is not allowed to be empty'}
  `('When $field is empty, %errorMessage is received', async ({field, errorMessage}) => {
    const userModified: NewUser = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = '';
    const response = await postUser(userModified);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpStatusOnlyFailed);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors[field]).toBe(errorMessage);
  });

  test.each`
    field           | expectedMessage
    ${'username'}   | ${'"username" must be a string'}
    ${'password'}   | ${'"password" must be a string'}
    ${'email'}      | ${'"email" must be a string'}
  `('When $field is null, %expectedMessage is received', async ({field, expectedMessage}) => {
    const userModified: UserModified= {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = null;
    const response = await postUser(userModified);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpStatusOnlyFailed);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors[field]).toBe(expectedMessage);
  });

  test.each`
    password            | expected
    ${'password'}       | ${signUpFailedPasswordError}
    ${'password@123'}   | ${signUpFailedPasswordError}
    ${'823472734'}      | ${signUpFailedPasswordError}
    ${'P4S5WORDS'}      | ${signUpFailedPasswordError}
    ${'P1@a'}           | ${signUpFailedPasswordLess8}
    ${'%^&*('}          | ${signUpFailedPasswordLess8}
    ${'Su&^;I4'}        | ${signUpFailedPasswordLess8}
  `('This PASSWORD: $password is invalid', async ({password, expected}) => {
    const userModified: UserModified= {
      username: 'user1',
      email: 'user1@gmail.com',
      password: password,
    };

    const response = await postUser(userModified);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(expected);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors.password).toBe(expected.message);
  });

  test.each([
    ['email'],
    ['email@'],
    ['@yahoo'],
    ['email@yahoo'],
    ['email@yahoo..com'],
    ['email@@yahoo..com'],
    ['email@gmailcom'],
    ['emailgmailcom'],
  ])('This email: "%s" is invalid', async (email:string) => {
    const userModified: UserModified = {
      username: 'user1',
      email: email,
      password: 'PpaSwo#rD9d',
    };
    const response = await postUser(userModified);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpFailedInvalidEmail);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors.email).toBe(signUpFailedInvalidEmail.message);
  });

  test('calls handleSignUpError when createUser throws error', async () => {
    jest.spyOn(UserHelperModel, 'createUser').mockImplementation(() => {
      throw new Error('Some Errors!!!!!');
    });

    const response = await postUser();
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      signUpStatus: 'failed',
      message: 'Some Errors!!!!!',
    });
  });

  test('Return 400 & error message when user name exists', async () => {
    await postUser();
    const response = await postUser();

    expect(response.status).toBe(400);

    const responseBody = generateResponseFailedUserExist(userBodyValid);
    expect(response.body).toMatchObject(responseBody);
    expect(response.body.validationErrors.username).toBe(responseBody.validationErrors?.username);
  });

  test('Return 400 & error message when email exists', async () => {
    await postUser(bodyValid);
    const response = await postUser(bodyValidSameEmail);

    expect(response.status).toBe(400);

    const responseBody = generateResponseFailedEmailExist(bodyValidSameEmail.email);
    expect(response.body).toMatchObject(responseBody);
    expect(response.body.validationErrors.email).toBe(responseBody.validationErrors?.email);
  });
});

describe('UserHelperController', () => {
  describe('handleSignUpError', () => {
    test('should return a 400 response with a failed status ' + 
    'and error message when passed an error object', async () => {
      const error = new Error('Database doesn\'t exist');
      const res: Response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      UserHelperController.handleSignUpError(error, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        signUpStatus: 'failed',
        message: 'Database doesn\'t exist',
      }));
    });

    test('should return a 400 response with a failed status and' +
    '"Unknown Error" message when passed an unknown error', async () => {
      const error = { message: 'Something went wrong' };
      const res: Response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      UserHelperController.handleSignUpError(error, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        signUpStatus: 'failed',
        message: 'Unknown Error',
      }));
    });
  });
});

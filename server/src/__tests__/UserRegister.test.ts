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

const bodyWithoutUserName: NewUser = {
  username: '',
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};

const bodyWithUserNameNull = {
  username: null,
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};

const bodyValid: NewUser = {
  username: 'user1',
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};
const userBodyValid = 'user1';
const emailBodyValid = 'user1@gmail.com';
const passBodyValid = 'A4GuaN@SmZ';

const bodyWithInvalidPass: NewUser = {
  username: 'useruser1',
  email: 'user1@gmail.com',
  password: 'password',
};

const bodyWithInvalidPass2:NewUser = {
  username: 'useruser1',
  email: 'user1@gmail.com',
  password: 'P@assword',
};

const signUpFailedPasswordError = {
  signUpStatus: 'failed',
  message:
    'Password must contain at least 1 uppercase, ' + 
    '1 lowercase, 1 symbol, and 1 number.',
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

function generateResponseFailedUserExist(email: string): ResponseUserCreatedFailed {
  return {
    signUpStatus: SIGNUP_STATUS.failed,
    message: `Email: ${email} already exists`,
  };
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postUser(user: any) {  
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
    return sequelize.sync();
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
      const response = await postUser(bodyValid);
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
    await postUser(bodyValid);
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(savedUser.password).not.toBe(passBodyValid);
  });

  test('Returns 400 & error message, when the sign up form is invalid', async () => {
    const response = await postUser(bodyWithoutUserName);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpStatusOnlyFailed);
    expect(response.body.message !== undefined).toBe(true);
  });

  test('Returns 400 & error message, when the user name is null', async () => {
    const response = await postUser(bodyWithUserNameNull);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpStatusOnlyFailed);
    expect(response.body.message !== undefined).toBe(true);
  });

  test('Returns error message when the password is invalid', async () => {
    const response = await postUser(bodyWithInvalidPass);

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(signUpFailedPasswordError);

    const response2 = await postUser(bodyWithInvalidPass2);

    expect(response2.status).toBe(400);
    expect(response.body).toStrictEqual(signUpFailedPasswordError);
  });

  test('calls handleSignUpError when createUser throws error', async () => {
    jest.spyOn(UserHelperModel, 'createUser').mockImplementation(() => {
      throw new Error('Some Errors!!!!!');
    });

    const response = await postUser(bodyValid);
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      signUpStatus: 'failed',
      message: 'Some Errors!!!!!',
    });
  });

  test('Return 400 & error message when user with email exists', async () => {
    await postUser(bodyValid);
    const response = await postUser(bodyValid);

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(generateResponseFailedUserExist(emailBodyValid));
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
      expect(res.send).toHaveBeenCalledWith({
        signUpStatus: 'failed',
        message: 'Database doesn\'t exist',
      });
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
      expect(res.send).toHaveBeenCalledWith({
        signUpStatus: 'failed',
        message: 'Unknown Error',
      });
    });
  });
});

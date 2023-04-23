import request from 'supertest';
import { app } from '../app';
import { User, NewUser, UserHelperModel } from '../models';
import { sequelize } from '../config/database';
import { UserHelperController } from '../controllers';
import { Response, Request } from 'express';
import { 
  SIGNUP_STATUS, 
  ResponseUserCreatedSuccess
  // ResponseUserCreatedFailed 
} from '../models';
import { ErrorMessageInvalidJSON } from '../utils';
import { SMTPServer } from 'smtp-server';

interface optionPostUser {
  language?: string,
}

class ErrorSimulate extends Error {
  public responseCode = 0;
  constructor(message: string) {
    super(message);
  }
}

const bodyValid: NewUser = {
  username: 'user1',
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};
const userBodyValid = 'user1';
const emailBodyValid = 'user1@gmail.com';
const passBodyValid = 'A4GuaN@SmZ';
const longUserName = 'akaksjdyrhakaksjdyrhakaksjdyrha';

const bodyValidSameEmail: NewUser = {
  username: 'userFree',
  email: 'user1@gmail.com',
  password: 'A4GuaN@SmZ',
};

function generateResponseSuccessBodyValid(
  savedUser: User,
  successMessage: string
): ResponseUserCreatedSuccess {
  return {
    signUpStatus: SIGNUP_STATUS.success,
    message: successMessage,
    user: {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
    },
  };
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postUser(user: any = bodyValid, option: optionPostUser = {}) {

  const agent = request(app).post('/api/1.0/users');

  if (option.language){
    agent.set('Accept-Language', option.language);
  }

  return await agent.send(user);
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

function signUpFailedGenerator(field: string, errorMessage: string) {
  const objectResponse = {
    signUpStatus: SIGNUP_STATUS.failed,
    message: errorMessage,
    validationErrors: {
      [field]: errorMessage,
    },
  };
  return objectResponse;
}

function generateErrorUserExist(field: string,  value: string, errorUserExist: string): string {
  return `${field}: ${value} ${errorUserExist}`;
}

let lastMail: string;
let server: SMTPServer;
let simulateSmtpFailure = false;

beforeAll( () => {
  server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody = '';
      stream.on('data', (data) => {
        mailBody += data.toString();
      });
      stream.on('end', () => {
        if (simulateSmtpFailure) {
          const err = new ErrorSimulate('Invalid mailbox');
          err.responseCode = 533;
          return callback(err);
        }
        lastMail = mailBody;
        callback();
      });
    },
  });

  server.listen(8585, 'localhost');

  return sequelize.sync({force:true});
});

beforeEach(() => {
  simulateSmtpFailure = false;
  jest.restoreAllMocks();
  return User.destroy({ truncate: true });
});

afterAll(() => {
  server.close();
});

describe('User Registration API', () => {
  const errorPassword1 = 'Password must contain at least 1 uppercase, 1 lowercase, 1 symbol, and 1 number';
  const errorPassword2 = '"password" length must be at least 8 characters long';
  const errorUsernameEmpty = '"username" is not allowed to be empty';
  const errorEmailEmpty = '"email" is not allowed to be empty';
  const errorPasswordEmpty = '"password" is not allowed to be empty';
  const errorUsernameNull = '"username" must be a text';
  const errorEmailNull = '"email" must be a text';
  const errorPasswordNull = '"password" must be a text';
  const errorEmailInvalid = '"email" must be a valid email';
  const errorUserExist = 'already exists';
  const userCreated = 'User is created';
  const userSizeMin = '"username" must be at least 3 characters long';
  const userSizeMax = '"username" must not be longer than 30 characters long';
  const customFieldNotAllowed = 'Custom Field is not allowed';
  const emailFailure = 'Email Failure';
  
  test('Returns 400 & error Message, when JSON Request is invalid', async () => {
    const response = await postInvalidJson();

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(errorMessageInvalidJson1);
  });

  test('hashes the password in the database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(savedUser.password).not.toBe(passBodyValid);
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
  //todo: refactor this in to Returns 200
  test('creates user in inactive mode', async () => {
    const response = await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(response.status).toBe(200);
    expect(savedUser.inactive).toBe(true);
  });
  //todo: refactor this in to Returns 200
  test('creates an activationToken for user', async () => {
    const response = await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(response.status).toBe(200);
    expect(savedUser.activationToken).toBeTruthy();
  });
  //todo: refactor this in to Returns 200
  test('sends an Account activation email with activationToken', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(lastMail).toContain('user1@gmail.com');
    expect(lastMail).toContain(savedUser.activationToken);
  });

  test('returns 502 bad gateway when sending email fails', async () => {
    // jest.spyOn( EmailService, 'sendAccountActivation')
    //   .mockRejectedValue({message: 'Failed to deliver email'});

    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.status).toBe(502);
  });
  //Internationalization4
  test('returns Email failure when sending email fails', async () => {
    // jest.spyOn( EmailService, 'sendAccountActivation')
    //   .mockRejectedValue({message: 'Failed to deliver email'});
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.body.message).toBe(emailFailure);
  });
  //Internationalization5
  test('It doesn\'t save user if activation email fails ', async () => {
    // jest.spyOn( EmailService, 'sendAccountActivation')
    //   .mockRejectedValue({message: 'Failed to deliver email'});
    simulateSmtpFailure = true;
    const response = await postUser();
    const users = await User.findAll();
    expect(response.body.message).toBe(emailFailure);
    expect(users.length).toBe(0);
  });
  //Internationalization1
  test(`Returns 200 + ${userCreated} + save to database, when the sign up request is valid`, 
    async () => {
      const response = await postUser();
      const userList = await User.findAll();
      const savedUser = userList[0];

      expect(response.status).toBe(200);

      expect(response.body).toStrictEqual(
        generateResponseSuccessBodyValid(savedUser, userCreated)
      );

      expect(userList.length).toBe(1);
      expect(savedUser.username).toBe(userBodyValid);
      expect(savedUser.email).toBe(emailBodyValid);
  });
  //Internationalization2
  test.each`
    field             | value                     | errorMessage
    ${'username'}     | ${''}                     | ${errorUsernameEmpty}
    ${'email'}        | ${''}                     | ${errorEmailEmpty}
    ${'password'}     | ${''}                     | ${errorPasswordEmpty}
    ${'username'}     | ${null}                   | ${errorUsernameNull}
    ${'email'}        | ${null}                   | ${errorEmailNull}
    ${'password'}     | ${null}                   | ${errorPasswordNull}
    ${'password'}     | ${'password'}             | ${errorPassword1}
    ${'password'}     | ${'password@123'}         | ${errorPassword1}
    ${'password'}     | ${'823472734'}            | ${errorPassword1}
    ${'password'}     | ${'P4S5WORDS'}            | ${errorPassword1}
    ${'password'}     | ${'P1@a'}                 | ${errorPassword2}
    ${'password'}     | ${'%^&*('}                | ${errorPassword2}
    ${'password'}     | ${'Su&^;I4'}              | ${errorPassword2}
    ${'email'}        | ${'email'}                | ${errorEmailInvalid}
    ${'email'}        | ${'email@'}               | ${errorEmailInvalid}
    ${'email'}        | ${'@yahoo'}               | ${errorEmailInvalid}
    ${'email'}        | ${'email@yahoo'}          | ${errorEmailInvalid}
    ${'email'}        | ${'email@yahoo..com'}     | ${errorEmailInvalid}
    ${'email'}        | ${'email@@yahoo.com'}     | ${errorEmailInvalid}
    ${'email'}        | ${'email@gmailcom'}       | ${errorEmailInvalid}
    ${'email'}        | ${'emailgmailcom'}        | ${errorEmailInvalid}
    ${'username'}     | ${'as'}                   | ${userSizeMin}
    ${'username'}     | ${longUserName}           | ${userSizeMax}
    ${'inactive'}     | ${true}                   | ${customFieldNotAllowed}
    ${'asdf'}         | ${'asdf'}                 | ${customFieldNotAllowed}
  `('If $field is = "$value", $errorMessage is received', async({field, value, errorMessage}) => {

    const expectedResponse = signUpFailedGenerator(field, errorMessage);
    const userModified: NewUser = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = value;
    const response = await postUser(userModified);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(expectedResponse);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors[field]).toBe(expectedResponse.validationErrors[field]);
  });
  //Internationalization3
  test.each`
    duplicatefield      | postBody
    ${'username'}       | ${bodyValid}
    ${'email'}          | ${bodyValidSameEmail}
  `('If $duplicatefield exist, returns 400 & error message', async({duplicatefield, postBody}) => {

    await postUser(bodyValid);
    const response = await postUser(postBody);

    const errorMessage = generateErrorUserExist(duplicatefield, postBody[duplicatefield], errorUserExist);
    const expectedResponse = signUpFailedGenerator(duplicatefield, errorMessage);

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject(expectedResponse);
    expect(response.body.validationErrors[duplicatefield]).toBe(expectedResponse.validationErrors[duplicatefield]);
  });
  // TODO: Test for several field errors. It should return object with validationErros properties for all field. 
});

describe('Internationalization', () => {
  const errorPassword1 = 'Kata sandi harus mengandung 1 huruf besar, 1 huruf kecil, 1 simbol, & 1 angka';
  const errorPassword2 = 'panjang "kata sandi" minimal harus 8 karakter';
  const errorUsernameEmpty = '"nama pengguna" tidak boleh kosong';
  const errorEmailEmpty = '"email" tidak boleh kosong';
  const errorPasswordEmpty = '"kata sandi" tidak boleh kosong';
  const errorUsernameNull = '"nama pengguna" harus berupa text';
  const errorEmailNull = '"nama pengguna" harus berupa text';
  const errorPasswordNull = '"kata sandi" harus berupa text';
  const errorEmailInvalid = '"email" harus berupa email yang valid';
  const errorUserExist = 'sudah terdaftar';
  const userCreated = 'Akun pengguna telah dibuat';
  const userSizeMin = '"nama pengguna" minimal harus 3 karakter';
  const userSizeMax = '"nama pengguna" tidak boleh lebih dari 30 karakter';
  const customFieldNotAllowed = 'Field acak tidak diperbolehkan';
  const emailFailure = 'Gagal mengirimkan email';
  
  //Internationalization1
  test(`Returns 200 + ${userCreated} + save to database, when the sign up request is valid`, 
  async () => {
    const response = await postUser(bodyValid, {language:'id'});
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual(
      generateResponseSuccessBodyValid(savedUser, userCreated)
    );

    expect(userList.length).toBe(1);
    expect(savedUser.username).toBe(userBodyValid);
    expect(savedUser.email).toBe(emailBodyValid);
  });
  //Internationalization2
  test.each`
    field             | value                     | errorMessage
    ${'username'}     | ${''}                     | ${errorUsernameEmpty}
    ${'email'}        | ${''}                     | ${errorEmailEmpty}
    ${'password'}     | ${''}                     | ${errorPasswordEmpty}
    ${'username'}     | ${null}                   | ${errorUsernameNull}
    ${'email'}        | ${null}                   | ${errorEmailNull}
    ${'password'}     | ${null}                   | ${errorPasswordNull}
    ${'password'}     | ${'password'}             | ${errorPassword1}
    ${'password'}     | ${'password@123'}         | ${errorPassword1}
    ${'password'}     | ${'823472734'}            | ${errorPassword1}
    ${'password'}     | ${'P4S5WORDS'}            | ${errorPassword1}
    ${'password'}     | ${'P1@a'}                 | ${errorPassword2}
    ${'password'}     | ${'%^&*('}                | ${errorPassword2}
    ${'password'}     | ${'Su&^;I4'}              | ${errorPassword2}
    ${'email'}        | ${'email'}                | ${errorEmailInvalid}
    ${'email'}        | ${'email@'}               | ${errorEmailInvalid}
    ${'email'}        | ${'@yahoo'}               | ${errorEmailInvalid}
    ${'email'}        | ${'email@yahoo'}          | ${errorEmailInvalid}
    ${'email'}        | ${'email@yahoo..com'}     | ${errorEmailInvalid}
    ${'email'}        | ${'email@@yahoo.com'}     | ${errorEmailInvalid}
    ${'email'}        | ${'email@gmailcom'}       | ${errorEmailInvalid}
    ${'email'}        | ${'emailgmailcom'}        | ${errorEmailInvalid}
    ${'username'}     | ${'as'}                   | ${userSizeMin}
    ${'username'}     | ${longUserName}           | ${userSizeMax}
    ${'inactive'}     | ${true}                   | ${customFieldNotAllowed}
    ${'asdf'}         | ${'asdf'}                 | ${customFieldNotAllowed}
  `('If $field is = "$value", $errorMessage is received', async({field, value, errorMessage}) => {
    const expectedResponse = signUpFailedGenerator(field, errorMessage);
    const userModified: NewUser = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = value;
    const response = await postUser(userModified, {language: 'id'});
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(expectedResponse);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors[field]).toBe(expectedResponse.validationErrors[field]);
  });
  //Internationalization3
  test.each`
    duplicatefield      | postBody
    ${'username'}       | ${bodyValid}
    ${'email'}          | ${bodyValidSameEmail}
  `('If $duplicatefield exist, returns 400 & error message', async({duplicatefield, postBody}) => {

    await postUser(bodyValid);
    const response = await postUser(postBody, {language: 'id'});

    const errorMessage = generateErrorUserExist(duplicatefield, postBody[duplicatefield], errorUserExist);
    const expectedResponse = signUpFailedGenerator(duplicatefield, errorMessage);

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject(expectedResponse);
    expect(response.body.validationErrors[duplicatefield]).toBe(expectedResponse.validationErrors[duplicatefield]);
  });
  //Internationalization4
  test(`returns "${emailFailure}" when sending email fails & language ID`, async () => {
    // jest.spyOn( EmailService, 'sendAccountActivation')
    //   .mockRejectedValue({message: 'Failed to deliver email'});
    simulateSmtpFailure = true;
    const response = await postUser(bodyValid, {language: 'id'});
    expect(response.body.message).toBe(emailFailure);
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

      const req: Request = {
        body: {
          // mock request body
        },
        headers: {
          // mock request headers
        },
        params: {
          // mock request params
        },
        query: {
          // mock query parameters
        },
        get: jest.fn((header) => {
          // mock get header function
          return req.headers[header];
        }),
      } as unknown as Request;

      UserHelperController.handleSignUpError(error, req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        signUpStatus: 'failed',
        message: 'Database doesn\'t exist',
      }));
    });

    test('should return a 400 response + Unknown Error Message when passed an unknown error', async () => {
      const error = { message: 'Something went wrong' };
      const res: Response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const req: Request = {
        body: {// mock request body
        },
        headers: {// mock request headers
        },
        params: {// mock request params
        },
        query: {// mock query parameters
        },
        get: jest.fn((header) => {
          // mock get header function
          return req.headers[header];
        }),
      } as unknown as Request;
      
      UserHelperController.handleSignUpError(error, req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        signUpStatus: 'failed',
        message: 'Unknown Error',
      }));
    });
  });
});

describe('Activating account', () => {
  test('Set the inactive properties to false if the token is correct', async () => {
    await postUser();
    let user = await User.findAll();
    const token = user[0].activationToken; 

    await request(app).post(`/api/1.0/users/token/${token}`).send();

    user = await User.findAll();

    expect(user[0].inactive).toBe(false);
  });
  test('Delete the token after user is activated', async () => {
    await postUser();
    let user = await User.findAll();

    const token = user[0].activationToken; 

    await request(app).post(`/api/1.0/users/token/${token}`).send();

    user = await User.findAll();

    expect(user[0].activationToken).toBeFalsy();
  });
});

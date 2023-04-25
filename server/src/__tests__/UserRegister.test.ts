import request from 'supertest';
import { app } from '../app';
import { User, NewUser, UserHelperModel } from '../models';
import { sequelize } from '../config/database';
// import { UserHelperController } from '../controllers';
// import { Response, Request } from 'express';
import { 
  ResponseUserCreatedSuccess
  // ResponseUserCreatedFailed 
} from '../models';
import { ErrorMessageInvalidJSON } from '../utils';
import { SMTPServer } from 'smtp-server';

enum messageTranslationEN {
  errorPassword1 = 'Password must contain at least 1 uppercase, 1 lowercase, 1 symbol, and 1 number',
  errorPassword2 = '"password" length must be at least 8 characters long',
  errorUsernameEmpty = '"username" is not allowed to be empty',
  errorEmailEmpty = '"email" is not allowed to be empty',
  errorPasswordEmpty = '"password" is not allowed to be empty',
  errorUsernameNull = '"username" must be a text',
  errorEmailNull = '"email" must be a text',
  errorPasswordNull = '"password" must be a text',
  errorEmailInvalid = '"email" must be a valid email',
  errorUserExist = 'already exists',
  userCreated = 'User is created',
  userSizeMin = '"username" must be at least 3 characters long',
  userSizeMax = '"username" must not be longer than 30 characters long',
  customFieldNotAllowed = 'Custom Field is not allowed',
  emailFailure = 'Email Failure',
  validationFailure = 'Validation Failure',
}

enum messageTranslationID {
  errorPassword1 = 'Kata sandi harus mengandung 1 huruf besar, 1 huruf kecil, 1 simbol, & 1 angka',
  errorPassword2 = 'panjang "kata sandi" minimal harus 8 karakter',
  errorUsernameEmpty = '"nama pengguna" tidak boleh kosong',
  errorEmailEmpty = '"email" tidak boleh kosong',
  errorPasswordEmpty = '"kata sandi" tidak boleh kosong',
  errorUsernameNull = '"nama pengguna" harus berupa text',
  errorEmailNull = '"nama pengguna" harus berupa text',
  errorPasswordNull = '"kata sandi" harus berupa text',
  errorEmailInvalid = '"email" harus berupa email yang valid',
  errorUserExist = 'sudah terdaftar',
  userCreated = 'Akun pengguna telah dibuat',
  userSizeMin = '"nama pengguna" minimal harus 3 karakter',
  userSizeMax = '"nama pengguna" tidak boleh lebih dari 30 karakter',
  customFieldNotAllowed = 'Field acak tidak diperbolehkan',
  emailFailure = 'Gagal mengirimkan email',
  validationFailure = 'Kegagalan Validasi',
}

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

function signUpFailedGenerator(field: string, errorMessage: string, message?: string) {
  let messageValue: string;
  if (message) {
    messageValue = message;
  }else {
    messageValue = errorMessage;
  }
  const objectResponse = {
    message: messageValue,
    validationErrors: {
      [field]: errorMessage,
    },
  };
  return objectResponse;
}

function generateErrorUserExist(field: string,  value: string, errorUserExist: string): string {
  return `${field}: ${value} ${errorUserExist}`;
}

async function sendTokenToServer(token: string, option?: optionPostUser) {
  const agent = request(app).post(`/api/1.0/users/token/${token}`);
  
  if (option?.language) {
    agent.set('Accept-Language', option.language);
  }
  return await agent.send();
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
  const {errorPassword1, errorPassword2, errorUsernameEmpty, errorEmailEmpty, errorPasswordEmpty,
    errorUsernameNull, errorEmailNull, errorPasswordNull, errorEmailInvalid, errorUserExist,
    userCreated, userSizeMin, userSizeMax, customFieldNotAllowed, emailFailure, validationFailure,
  } = messageTranslationEN;
  
  test('returns 400 & error Message, when JSON Request is invalid', async () => {
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
  // Error Handling instance of error
  test('calls handleSignUpError when createUser throws error', async () => {
    jest.spyOn(UserHelperModel, 'createUser').mockImplementation(() => {
      throw new Error('Some Errors!!!!!');
    });

    const response = await postUser();
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      message: 'Some Errors!!!!!',
    });
  });

  test('creates user in inactive mode: Inactive = true + Status Code = 200', async () => {
    const response = await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(response.status).toBe(200);
    expect(savedUser.inactive).toBe(true);
  });

  test('creates an activationToken for user', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];

    expect(savedUser.activationToken).toBeTruthy();
  });

  test('sends an Account activation email with activationToken', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(lastMail).toContain('user1@gmail.com');
    expect(lastMail).toContain(savedUser.activationToken);
  });

  test('returns 502 bad gateway when sending email fails', async () => {
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.status).toBe(502);
  });
  //Internationalization4
  test('returns Email failure when sending email fails', async () => {
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.body.message).toBe(emailFailure);
  });

  test('doesn\'t save user if activation email fails ', async () => {
    // jest.spyOn( EmailService, 'sendAccountActivation')
    //   .mockRejectedValue({message: 'Failed to deliver email'});
    simulateSmtpFailure = true;
    await postUser();
    const users = await User.findAll();
    expect(users.length).toBe(0);
  });
  //Internationalization1
  test(`returns 200 +  message: ${userCreated} + save to database, when the sign up request is valid`, 
    async () => {
      const response = await postUser();
      const userList = await User.findAll();
      const savedUser = userList[0];

      expect(response.status).toBe(200);

      expect(response.body).toStrictEqual(
        generateResponseSuccessBodyValid(savedUser, userCreated)
      );

      expect(userList.length).toBe(1); //save database
      expect(savedUser.username).toBe(userBodyValid); //save database
      expect(savedUser.email).toBe(emailBodyValid); //save database
  });
 
  test('returns 400 Status code when body validation fails', async () => {
    const response = await postUser({...bodyValid, username: null});
    expect(response.status).toBe(400);
  });
   //Internationalization6
  test(`returns .message: ${validationFailure} in the body when validation fails`, async () => {
    const response = await postUser({...bodyValid, username: null}, {language:'en'});
    expect(response.body.message).toBe(validationFailure);
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
  `('[.validationErrors]if $field is = "$value", $errorMessage is received', 
  async({field, value, errorMessage}) => {
    const expectedResponse = signUpFailedGenerator(field, errorMessage, validationFailure);
    const userModified: NewUser = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = value;
    const response = await postUser(userModified);
    expect(response.body.validationErrors[field]).toBe(expectedResponse.validationErrors[field]);
  });
  // Internationalization3
  test.each`
    duplicatefield      | postBody
    ${'username'}       | ${bodyValid}
    ${'email'}          | ${bodyValidSameEmail}
  `('if $duplicatefield exist, returns 400 & error message', async({duplicatefield, postBody}) => {

    await postUser(bodyValid);
    const response = await postUser(postBody);

    const errorMessage = generateErrorUserExist(duplicatefield, postBody[duplicatefield], errorUserExist);
    expect(response.status).toBe(400);
    expect(response.body.validationErrors[duplicatefield]).toBe(errorMessage);
  });
  // TODO: Test for several field errors. It should return object with validationErros properties for all field. 
});

describe('Internationalization', () => {
  const {errorPassword1, errorPassword2, errorUsernameEmpty, errorEmailEmpty, errorPasswordEmpty,
    errorUsernameNull, errorEmailNull, errorPasswordNull, errorEmailInvalid, errorUserExist,
    userCreated, userSizeMin, userSizeMax, customFieldNotAllowed, emailFailure, validationFailure,
  } = messageTranslationID;
  
  //Internationalization1
  test(`returns 200 + ${userCreated} + save to database, when the sign up request is valid`, 
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
  `('[.validationErrors]if $field is = "$value", $errorMessage is received', 
  async({field, value, errorMessage}) => {
    const expectedResponse = signUpFailedGenerator(field, errorMessage, validationFailure);
    const userModified: NewUser = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = value;
    const response = await postUser(userModified, {language: 'id'});
    expect(response.body.validationErrors[field]).toBe(expectedResponse.validationErrors[field]);
  });
  //Internationalization3
  test.each`
    duplicatefield      | postBody
    ${'username'}       | ${bodyValid}
    ${'email'}          | ${bodyValidSameEmail}
  `('if $duplicatefield exist, returns 400 & error message', async({duplicatefield, postBody}) => {

    await postUser(bodyValid);
    const response = await postUser(postBody, {language: 'id'});

    const errorMessage = generateErrorUserExist(duplicatefield, postBody[duplicatefield], errorUserExist);
    expect(response.status).toBe(400);
    expect(response.body.validationErrors[duplicatefield]).toBe(errorMessage);
  });
  //Internationalization4
  test(`returns "${emailFailure}" when sending email fails & language ID`, async () => {
    simulateSmtpFailure = true;
    const response = await postUser(bodyValid, {language: 'id'});
    expect(response.body.message).toBe(emailFailure);
  });
  //Internationalization6
  test(`returns .message: ${validationFailure} in the body when validation fails, language; ID`, async () => {
    const response = await postUser({...bodyValid, username: null}, {language:'id'});
    expect(response.body.message).toBe(validationFailure);
  });
});

describe('Activating account', () => {

  const tokenErrorEN = 'This account is either active, or the token is invalid';
  const tokenErrorID = 'Akun ini telah aktif, atau token tidak valid';
  const accountActivatedEN = 'Account is activated';
  const accountActivatedID = 'Akun telah berhasil diaktifkan';

  test('set the inactive properties to false if the token is correct', async () => {
    await postUser();
    let user = await User.findAll();
    const token = user[0].activationToken; 

    await sendTokenToServer(token);

    user = await User.findAll();

    expect(user[0].inactive).toBe(false);
  });

  test('delete the token after user is activated', async () => {
    await postUser();
    let user = await User.findAll();

    const token = user[0].activationToken; 

    await sendTokenToServer(token);

    user = await User.findAll();

    expect(user[0].activationToken).toBeFalsy();
  });

  test('doesn\'t activate the user, if the token is wrong', async () => {
    await postUser();
    const token = 'wrong-token-you-know';

    await sendTokenToServer(token);

    const user = await User.findAll();

    expect(user[0].inactive).toBe(true);
  });

  test('returns 400 bad request, when the token is wrong', async () => {
    await postUser();
    const token = 'wrong-token-you-know';
    const response = await sendTokenToServer(token);
    expect(response.status).toBe(400);
  });
  //Internationalization
  test.each`
    language        | tokenStatus         | message
    ${'en'}         | ${'wrong'}          | ${tokenErrorEN}
    ${'id'}         | ${'wrong'}          | ${tokenErrorID}
    ${'en'}         | ${'correct'}        | ${accountActivatedEN}
    ${'id'}         | ${'correct'}        | ${accountActivatedID}
  `('if token is $tokenStatus & language $language, then "$message" is received',
  async({language, tokenStatus, message}) => {
    await postUser();
    
    let token: string;

    if (tokenStatus === 'wrong') {
      token = 'wrong-token-here';
    } else {
      const user = await User.findAll();
      token = user[0].activationToken;
    }

    const response = await sendTokenToServer(token, {language});
    expect(response.body.message).toBe(message);
  });
});

describe('Error Object', () => {
  test('returns path, timeStamp, message, & validation error when body validation fails[ErrorBodyValidation]',
  async () => {
    const response = await postUser({...bodyValid, username: null});
    expect(Object.keys(response.body)).toEqual(['path', 'timeStamp', 'message', 'validationErrors']);
  });
  test.each`
    duplicatefield      | postBody
    ${'username'}       | ${bodyValid}
    ${'email'}          | ${bodyValidSameEmail}
  `('returns path, timeStamp, message, & validation error when $duplicatefield exist[ErrorUserExists]',
  async({postBody}) => {
    await postUser(bodyValid);
    const response = await postUser(postBody);

    expect(Object.keys(response.body)).toEqual(['path', 'timeStamp', 'message', 'validationErrors']);
  });
  // ErrorToken is tested for the sample. properties are  in the generateResponse function
  test('returns path, timeStamp, message when request fails other than validation error[ErrorToken]', async () => {
    const token = 'wrong-token-you-know';
    const response = await sendTokenToServer(token);
    
    expect(Object.keys(response.body)).toEqual(['path', 'timeStamp', 'message']);
  });
  // ErrorSendEmailActivation is tested for the sample. properties are  in the generateResponse function
  test('return path, timeStamp, message when when sending email fails[ErrorSendEmailActivation]', async () => {
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(Object.keys(response.body)).toEqual(['path', 'timeStamp', 'message']);
  });
  // just Errortoken is tested for the sample. path is generated on top of the file. 
  test('returns path in error body => sample in [ErrorToken] ', async () => {
    const token = 'wrong-token-you-know';
    const response = await sendTokenToServer(token);
    expect(response.body.path).toEqual(`/api/1.0/users/token/${token}`);
  });
  // just Errortoken is tested for the sample. timeStamp is generated in the generateResponse function
  test('returns timestamp in ms within 5 sec value in error body', async () => {
    const nowInMillis = new Date().getTime();
    const fiveSecondsLater = nowInMillis + (5 * 1000);
    const token = 'wrong-token-you-know';
    const response = await sendTokenToServer(token);
    
    expect(response.body.timeStamp).toBeGreaterThan(nowInMillis);
    expect(response.body.timeStamp).toBeLessThan(fiveSecondsLater);
  });
});

//TO DO : Create a test for Error Handle
// describe('UserHelperController', () => {
//   describe('handleSignUpError', () => {
//     test('should return a 400 response with a failed status ' + 
//     'and error message when passed an error object', async () => {
//       const error = new Error('Database doesn\'t exist');
//       const res: Response = {
//         status: jest.fn().mockReturnThis(),
//         send: jest.fn(),
//       } as unknown as Response;

//       const req: Request = {
//         body: {
//           // mock request body
//         },
//         headers: {
//           // mock request headers
//         },
//         params: {
//           // mock request params
//         },
//         query: {
//           // mock query parameters
//         },
//         get: jest.fn((header) => {
//           // mock get header function
//           return req.headers[header];
//         }),
//       } as unknown as Request;

//       UserHelperController.handleSignUpError(error, req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
//         message: 'Database doesn\'t exist',
//       }));
//     });

//     test('should return a 400 response + Unknown Error Message when passed an unknown error', async () => {
//       const error = { message: 'Something went wrong' };
//       const res: Response = {
//         status: jest.fn().mockReturnThis(),
//         send: jest.fn(),
//       } as unknown as Response;

//       const req: Request = {
//         body: {// mock request body
//         },
//         headers: {// mock request headers
//         },
//         params: {// mock request params
//         },
//         query: {// mock query parameters
//         },
//         get: jest.fn((header) => {
//           // mock get header function
//           return req.headers[header];
//         }),
//       } as unknown as Request;
      
//       UserHelperController.handleSignUpError(error, req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
//         message: 'Unknown Error',
//       }));
//     });
//   });
// });

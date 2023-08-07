import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import request from 'supertest';
import { app } from '../app';
import { sequelize } from '../config/database';
import { 
  User,
  UserHelperModel,
  Auth
} from '../models';

import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

import { SMTPServer } from 'smtp-server';

let lastMail: string;
let server: SMTPServer;
let simulateSmtpFailure = false;

class ErrorSimulate extends Error {
  public responseCode = 0;
  constructor(message: string) {
    super(message);
  }
}

const emailUser1 = 'user1@gmail.com';
const randomPassword = 'B4GuaN@SmZ';
const randomPasswordResetToken = 'abcde';

const API_URL_RESET_PASSWORD = '/api/1.0/user/password';
const API_URL_UPDATE_PASSWORD = '/api/1.0/user/password';
  
async function postResetPassword(
  email:string = emailUser1,
  language = 'en'
) {
  return await request(app)
    .post(API_URL_RESET_PASSWORD)
    .set('Accept-Language', language)
    .send({
      email,
  });
}

async function putPasswordUpdate(
  body: {
    password: string,
    passwordResetToken: string,
  } = {
    password: randomPassword,
    passwordResetToken: randomPasswordResetToken,
  }
  , 
  options:{language: string } | null =  null
) {
  const {password, passwordResetToken} = body;
  const agent = request(app).put(API_URL_UPDATE_PASSWORD);

  if (options?.language) {
    agent.set('Accept-Language', options.language);
  }
  return await agent
    .send({
      password, 
      passwordResetToken, 
    });
}

async function createUserPostResetPutPassword(
  password = randomPassword,
  language = 'en'
) {
    const user = await UserHelperModel.addMultipleNewUsers(0, 1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });

    if (!userInDB) {
      throw new Error('Something error with DB');
    }
    userInDB.activationToken = 'random';
    await userInDB.save();

    const token = userInDB?.passwordResetToken;

    if (!token) {
      throw new Error('Something wrong with the db');
    }

    return await putPasswordUpdate(
      {
        password,
        passwordResetToken: token,
      },
      {
        language,
      }
    );
}

beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
  
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
});

beforeEach( async () => {
  simulateSmtpFailure = false;
  jest.restoreAllMocks();
  await User.destroy({truncate: true});
});

afterAll(async () => {
  await sequelize.close();
  server.close();
});

describe('Password Reset Request', () => {

  test('returns 404 when a password reset request is sent for unknown email',  async () => {
    const response = await postResetPassword();

    expect(response.status).toBe(404);
  });

  test.each`
  language    | message
  ${'en'}     | ${en.emailNotInuse}
  ${'id'}     | ${id.emailNotInuse}
  `('return error body with "$message" for unknown email when language is "$language"', 
  async({language, message}) => {
    const nowInMilis = new Date().getTime();
    const response = await postResetPassword(emailUser1, language);

    expect(response.body.path).toBe(API_URL_RESET_PASSWORD);
    expect(response.body.timeStamp).toBeGreaterThan(nowInMilis);
    expect(response.body.message).toBe(message);
  });

  test.each`
  language   | email         | message
  ${'en'}    | ${''}         | ${en.errorEmailEmpty}
  ${'id'}    | ${''}         | ${id.errorEmailEmpty}
  ${'en'}    | ${'aguan@'}   | ${en.errorEmailInvalid}
  ${'id'}    | ${'aguan@'}   | ${id.errorEmailInvalid}
  `('return 400 with validation Error "$message" when email is "$email" and language is "$language"', 
  async({language, email, message}) => {
    const response = await postResetPassword(email, language);

    expect(response.body.validationErrors.email).toBe(message);
    expect(response.status).toBe(400);
  });

  test('returns 200 ok when a password reset request is sent for known email', async () => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    const response = await postResetPassword(user[0].email);
    expect(response.status).toBe(200);
  }); 

  test.each`
  language    | message
  ${'en'}     | ${en.passwordResetRequestSuccess}
  ${'id'}     | ${id.passwordResetRequestSuccess}
  `('returns success response body with the message "$message" for known email when language is "$language"',
  async({language, message}) => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    const response = await postResetPassword(user[0].email, language);

    expect(response.body.message).toBe(message);
  });

  test('creates passwordResetToken when a password reset request is senf from known email', async () => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });

    expect(userInDB?.passwordResetToken).toBeTruthy();

  });

  test('creates passwordResetToken when a password reset request is senf from known email', async () => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });
    expect(userInDB?.passwordResetToken).toBeTruthy();
  });

  test('sends a password reset email wiht passwordResetToken', async () => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });

    const passwordResetToken = userInDB?.passwordResetToken;
    expect(lastMail).toContain(user[0].email);
    expect(lastMail).toContain(passwordResetToken);
  });

  test('returns 502 Bad Gateway when sending email fails', async () => {
    simulateSmtpFailure = true;
    const user = await UserHelperModel.addMultipleNewUsers(1);
    const response = await postResetPassword(user[0].email);
    expect(response.statusCode).toBe(502);
  });

  test.each`
  language    | message
  ${'en'}     | ${en.emailFailure}
  ${'id'}     | ${id.emailFailure}
  `('returns error body with the message "$message" when sending email is failed & language is "$language"',
  async({language, message}) => {
    simulateSmtpFailure = true;
    const user = await UserHelperModel.addMultipleNewUsers(1);
    const response = await postResetPassword(user[0].email, language);
    expect(response.body.message).toBe(message);
  });

});

describe('Password Update', () => {
  test('returns 403 when password update request does not have the valid token', async () => {
    const response = await putPasswordUpdate();
    expect(response.status).toBe(403);
  });

  test.each`
  language    | message
  ${'id'}     | ${id.unauthPasswordReset}
  ${'en'}     | ${en.unauthPasswordReset}
  `('returns error body with "$message" if the passwordResetToken invalid when language is "$language"',
  async({language, message}) => {
    const nowInMilis = new Date().getTime();
    const response = await putPasswordUpdate(
      {
        password: randomPassword,
        passwordResetToken: randomPasswordResetToken,
      },
      {
        language: language,
      }
    );

    expect(response.body.path).toBe(API_URL_UPDATE_PASSWORD);
    expect(response.body.timeStamp).toBeGreaterThan(nowInMilis);
    expect(response.body.message).toBe(message);
  });

  test('returns 403 when the password request is invalid and reset token is invalid', async () => {
    const response = await putPasswordUpdate(
      {
        password: 'as',
        passwordResetToken: 'as',
      });

      expect(response.status).toBe(403);
  });

  test('return 400 when trying to update with invalid password, and reset token is valid', async () => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });
    const token = userInDB?.passwordResetToken;

    if (!token) {
      throw new Error('Something wrong with the db');
    }

    const response = await putPasswordUpdate(
      {
        password: 'as',
        passwordResetToken: token,
      }
    );

    expect(response.status).toBe(400);
  });

  test.each`
    language    | value                     | errorMessage
    ${'en'}     | ${null}                   | ${en.errorPasswordNull}
    ${'en'}     | ${'password'}             | ${en.errorPassword1}
    ${'en'}     | ${'password@123'}         | ${en.errorPassword1}
    ${'en'}     | ${'823472734'}            | ${en.errorPassword1}
    ${'en'}     | ${'P4S5WORDS'}            | ${en.errorPassword1}
    ${'en'}     | ${'P1@a'}                 | ${en.errorPassword2}
    ${'en'}     | ${'%^&*('}                | ${en.errorPassword2}
    ${'id'}     | ${null}                   | ${id.errorPasswordNull}
    ${'id'}     | ${'password'}             | ${id.errorPassword1}
    ${'id'}     | ${'password@123'}         | ${id.errorPassword1}
    ${'id'}     | ${'823472734'}            | ${id.errorPassword1}
    ${'id'}     | ${'P4S5WORDS'}            | ${id.errorPassword1}
    ${'id'}     | ${'P1@a'}                 | ${id.errorPassword2}
    ${'id'}     | ${'%^&*('}                | ${id.errorPassword2}
  `('[password validationErrors] returns "$errorMessage" when "$value" is received when language is "$language"', 
  async({language, value, errorMessage}) => {
    const response = await createUserPostResetPutPassword(value, language);

    if (language === 'en') {
      expect(response.body.message).toBe(en.validationFailure);
    }

    if (language === 'id') {
      expect(response.body.message).toBe(id.validationFailure);
    }

    expect(response.body.validationErrors['password']).toBe(errorMessage);

  });

  test('returns 200 Ok when valid password is send with valid reset token ', async () => {
    const response = await createUserPostResetPutPassword();

    expect(response.status).toBe(200);
  });

  test('updates the password in database when valid password is send with valid reset token ', async () => {
    await createUserPostResetPutPassword();

    const userUpdateInDM = await User.findOne({
      where: {
        email: emailUser1,
      },
    });

    expect(userUpdateInDM?.password).not.toEqual(emailUser1);
  });

  test('clears the reset token in database when the request is valid ', async () => {
    await createUserPostResetPutPassword();

    const userUpdateInDM = await User.findOne({
      where: {
        email: emailUser1,
      },
    });

    expect(userUpdateInDM?.passwordResetToken).toBeFalsy();
  });

  test('activates and clears activation Token if the account is inactive after valid password reset', async () => {
    await createUserPostResetPutPassword();

    const userUpdateInDM = await User.findOne({
      where: {
        email: emailUser1,
      },
    });

    expect(userUpdateInDM?.inactive).toBe(false);
    expect(userUpdateInDM?.activationToken).toBeFalsy();
  });

  test('It clears all tokens of User, when password has changed', async () => {
    // I don't refactor this since I only use it once. 
    const user = await UserHelperModel.addMultipleNewUsers(0, 1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });

    if (!userInDB) {
      throw new Error('Something error with DB');
    }
    userInDB.activationToken = 'random';
    await userInDB.save();

    await Auth.create({
      userID: userInDB.id,
      token: 'randomtoken',
      lastUsedAt: new Date(Date.now()),
    });

    const token = userInDB?.passwordResetToken;

    if (!token) {
      throw new Error('Something wrong with the db');
    }

    await putPasswordUpdate(
      {
        password: randomPassword,
        passwordResetToken: token,
      }
    );

    const tokens = await Auth.findAll({
      where: {
        userID: userInDB.id,
      },
    });

    expect(tokens.length).toBe(0);
  
  });
});


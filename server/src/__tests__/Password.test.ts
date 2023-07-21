import request from 'supertest';
import { app } from '../app';
import { sequelize } from '../config/database';
import { 
  User,
  UserHelperModel
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


beforeAll( async () => {
  await sequelize.sync();
  
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


const emailUser1 = 'user1@gmail.com';

const API_URL_RESET_PASSWORD = '/api/1.0/user/password-reset';
  
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

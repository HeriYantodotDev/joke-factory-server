import request from 'supertest';
import { app } from '../app';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const API_URL_RESET_PASSWORD = '/api/1.0/password-reset';
const user1Email = 'user1@gmail.com';
  
async function postResetPassword(
  email:string = user1Email,
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
    const response = await postResetPassword(user1Email, language);

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

});

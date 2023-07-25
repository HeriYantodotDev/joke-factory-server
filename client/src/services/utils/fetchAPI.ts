const env = process.env.NODE_ENV;

console.log(env);

const root = 
  env === 'development'
    ? 'http://localhost:3000'
    : env === 'test'
      ? 'http://localhost:5173'
      : env === 'production'
        ? 'define-it-later'
        : '';

export const API_ROOT_URL = root + '/api/1.0';

export class FetchAPI {
  static async post(apiURL: string, body: object) {
    return await fetch(API_ROOT_URL + apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }
}
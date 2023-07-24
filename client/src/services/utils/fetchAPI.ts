export const API_ROOT_URL = '/api/1.0';

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
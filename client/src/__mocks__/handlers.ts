import { rest } from 'msw';
import { API_ROOT_URL } from '../services/utils/fetchAPI';
import { setupServer } from 'msw/node';

export const handlers = [
  rest.post( API_ROOT_URL + '/users', async (req, res, ctx) => {
    req;
    return await res(
      // Respond with a 200 status code
      ctx.status(200),
    );
  }),
];

export const server = setupServer(...handlers);

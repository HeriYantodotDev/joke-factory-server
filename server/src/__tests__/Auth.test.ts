import request from 'supertest';
import { app } from '../app';
import { User, UserHelperModel, CredentialBody} from '../models';
import { sequelize } from '../config/database';


beforeAll( async () => {
  await sequelize.sync();
});

beforeEach( async () => {
  await User.destroy({truncate: true});
});

afterAll(async () => {
  await sequelize.close();
});

const emailUser1 = 'user1@gmail.com';
const passwordUser1 = 'A4GuaN@SmZ';
const API_URL_POST_AUTH = '/api/1.0/auth';

async function postAuthentication(credentials: CredentialBody) {
  return await request(app).post(API_URL_POST_AUTH).send(credentials);
}

async function postAuthenticationUser1() {
  return await postAuthentication({
    email: emailUser1,
    password: passwordUser1,
  });
}

describe('Authentication', () => {
  test('returns 200 when credentials are correct', async() => {
    await UserHelperModel.addMultipleNewUsers(1);
    const response = await postAuthenticationUser1();
    expect(response.status).toBe(200);
  });

  test('returns only user id and user name when login success', async() => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    const response = await postAuthenticationUser1();
    expect(response.body.id).toBe(user[0].id);
    expect(response.body.username).toBe(user[0].username);
    expect(Object.keys(response.body)).toEqual(['id', 'username']);
  });
});


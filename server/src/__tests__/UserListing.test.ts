import request from 'supertest';
import { app } from '../app';
import { User, UserPagination, UserHelperModel} from '../models';
import { sequelize } from '../config/database';
import { optionPostUser } from './UserRegister.test';

import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const addMultipleNewUsers = UserHelperModel.addMultipleNewUsers;
const responseUserPaginationBlank: UserPagination = {
  content: [],
  page: 0,
  size: 10,
  totalPages: 0,
};

const emailUser1 = 'user1@gmail.com';
const passwordUser1 = 'A4GuaN@SmZ';

interface optionAuth {
  auth?: {
    email: string,
    password: string,
  },
}

async function getUser (page = 0, options: optionAuth = {} ) {
  const agent = request(app).get('/api/1.0/users').query({page});
  if (options.auth) {
    const {email, password} = options.auth;
    agent.auth(email, password);

  }
  return await agent;
}

async function getUserWithSize (size = 10) {
  return await request(app).get('/api/1.0/users').query({size});
}

async function getUserByID(id = 5, option: optionPostUser = {}) {
  const agent = request(app).get(`/api/1.0/users/${id}`);
  if (option.language) {
    agent.set('Accept-Language', option.language);
  }

  return await agent;
}


beforeAll( async () => {
  await sequelize.sync();
});

beforeEach( async () => {
  await User.destroy({truncate: true});
});

afterAll(async () => {
  await sequelize.close();
});

describe('Listing users', () => {
  test('returns 200 ok when there are no user in database', async () => {
    const response = await getUser();
    expect(response.status).toBe(200);
  });

  test('returns page object as response body', async () => {
    const response = await getUser();
    expect(response.body).toEqual(responseUserPaginationBlank);
  });

  test('returns 10 users in page content when there are 11 users in the database', async () => {
    await addMultipleNewUsers(11);
    const response = await getUser();
    expect(response.body.content.length).toBe(10);
  });

  test('returns 6 active users in page content, when there are 6 active + 5 inactive users ', async () => {
    await addMultipleNewUsers(6, 5);
    const response = await getUser();
    expect(response.body.content.length).toBe(6);
  });

  test('returns only id, username, email [UserDataFromDB] type in the content array', async () => {
    await addMultipleNewUsers(10);
    const response = await getUser();
    const user = response.body.content;
    expect(Object.keys(user[0])).toEqual(['id', 'username', 'email']);
  });

  test('returns 2 as totalPages when there are 15 active and 7 inactiver users', async () => {
    await addMultipleNewUsers(15,7);
    const response = await getUser();
    expect(response.body.totalPages).toBe(2);
  });

  test('returns 2nd page users and page indicator when page is set as 1 in req params', async () => {
    await addMultipleNewUsers(11);
    const response = await getUser(1);
    expect(response.body.content[0].username).toBe('user11');
    expect(response.body.page).toBe(1);
  });

  test('returns first page when page is set below Zero as request parameter', async () => {
    await addMultipleNewUsers(11);
    const response = await getUser(-5);
    expect(response.body.page).toBe(0);
  });

  test('returns first page when page is set with giberish "asdf" as request parameter', async () => {
    await addMultipleNewUsers(11);
    const response = await request(app).get('/api/1.0/users').query({page: 'asdf'});
    expect(response.body.page).toBe(0);
  });

  test('returns 5 users and corresponding size indicator when size is set as 5 in req param', async () => {
    await addMultipleNewUsers(11);
    const response = await getUserWithSize(5);
    expect(response.body.content.length).toBe(5);
    expect(response.body.size).toBe(5);
  });

  test('returns 10 users and corresponding size indicator when size is set as 1000 in req param', async () => {
    await addMultipleNewUsers(11);
    const response = await getUserWithSize(1000);
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });

  test('returns 10 users and corresponding size indicator when size is set as 0 in req param', async () => {
    await addMultipleNewUsers(11);
    const response = await getUserWithSize(0);
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });

  test('returns page as zero and size as 10 when non number query params provided', async () => {
    await addMultipleNewUsers(11);
    const response = await request(app).get('/api/1.0/users').query({page: 'asdf', size: 'asdf'});
    expect(response.body.size).toBe(10);
    expect(response.body.page).toBe(0);
  });

  test('returns user page without logged-in user when request has valid authorization', async() => {
    await addMultipleNewUsers(11);
    const response = await getUser(0, {
    auth: {email: emailUser1,
      password: passwordUser1,
    },
    });
    expect(response.body.totalPages).toBe(1);
  });

});

describe('Get User', () => {
  test('returns 404 when user not found', async () => {
    const response = await getUserByID();
    expect(response.status).toBe(404);
  });

  test.each`
  language      | message
  ${'id'}       | ${id.userNotFound}
  ${'en'}       | ${en.userNotFound}
  `('returns $message for unknown user when language is set to $language', async ({language, message}) => {
    const response = await getUserByID(5, {language});
    expect(response.body.message).toBe(message);
  });

  test('returns proper error body when user not found', async () => {
    const nowToMillis = new Date().getTime();
    const response = await getUserByID();
    const error = response.body;
    expect(error.path).toBe('/api/1.0/users/5');
    expect(error.timeStamp).toBeGreaterThan(nowToMillis);
    expect(Object.keys(error)).toEqual(['path', 'timeStamp', 'message']);
  });

  test('returns 200 okay when an active user exist', async () => {
    const userList = await addMultipleNewUsers(1);
    const response = await getUserByID(userList[0].id);
    expect(response.status).toBe(200);
  });

  test('returns id, username, email in response an active user exist', async () => {
    const userList = await addMultipleNewUsers(1);
    const response = await getUserByID(userList[0].id);
    expect(Object.keys(response.body)).toEqual(['id', 'username', 'email']);
  });

  test('returns 404 when the user is inactive', async () => {
    const userList = await addMultipleNewUsers(0,1);
    const response = await getUserByID(userList[0].id);
    expect(response.status).toBe(404);
  });

});

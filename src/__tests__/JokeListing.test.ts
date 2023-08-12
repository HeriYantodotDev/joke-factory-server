import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import request from 'supertest';
import { app } from '../app';
import { optionPostUser } from './UserRegister.test';

import { User, Auth, Joke, JokePaginationResponseTypes, UserHelperModel} from '../models';
import { sequelize } from '../config/database';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const responseJokePaginationBlank: JokePaginationResponseTypes = {
  content: [],
  page: 0,
  size: 10,
  totalPages: 0,
};

async function getJokeWithSize (size = 10) {
  return await request(app).get('/api/1.0/jokes').query({size});
}

async function getUserByID(id = 5, option: optionPostUser = {}) {
  const agent = request(app).get(`/api/1.0/users/${id}`);
  if (option.language) {
    agent.set('Accept-Language', option.language);
  }

  return await agent;
}

beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach( async () => {
  await User.destroy({where: {}});
  await Auth.destroy({where: {}});
});

afterAll(async () => {
  await sequelize.close();
});

describe('Listing All Jokes', () => {
  async function getJokes(page = 0 ) {
    const agent = request(app).get('/api/1.0/jokes').query({page});
    return await agent;
  }

  async function addJokes(count: number) {
    const user = await UserHelperModel.addMultipleNewUsers(count,0);
    for (let i=0; i < count; i++) {
      await Joke.create({
        content: `Content Of Great Jokes all ${i+1}`,
        timestamp: Date.now(),
        userID: user[i].id,
      });
    }
  }

  test('returns 200 ok when there are no jokes in database', async () => {
    const response = await getJokes();
    expect(response.status).toBe(200);
  });

  test('returns page object as response body', async () => {
    const response = await getJokes();
    expect(response.body).toEqual(responseJokePaginationBlank);
  });

  test('returns 10 jokes in page content when there are 11 jokes in the database', async () => {
    await addJokes(11);
    const response = await getJokes();
    expect(response.body.content.length).toBe(10);
  });

  test('returns id, content, timestamp, & user object (id, username, email, image) in the content', async () => {
    await addJokes(10);

    const response = await getJokes();
    const joke = response.body.content[0];
    const jokeKeys = Object.keys(joke);
    const userKeys = Object.keys(joke.user);
    
    expect(jokeKeys).toEqual(['id', 'content', 'timestamp', 'user']);
    expect(userKeys).toEqual(['id', 'username', 'email', 'image']);
  });

  test('returns 2 as totalPages when there are 11 Jokes', async () => {
    await addJokes(11);
    const response = await getJokes();
    expect(response.body.totalPages).toBe(2);
  });

  test('returns 2nd page jokes and page indicator when page is set as 1 in req params', async () => {
    await addJokes(11);
    const response = await getJokes(1);
    expect(response.body.content[0].content).toBe('Content Of Great Jokes all 1');
    expect(response.body.page).toBe(1);
  });

  test('returns first page when page is set below Zero as request parameter', async () => {
    await addJokes(11);
    const response = await getJokes(-5);
    expect(response.body.page).toBe(0);
  });

  test('returns first page when page is set with gibberish "asdf" as request parameter', async () => {
    await addJokes(11);
    const response = await request(app).get('/api/1.0/jokes').query({page: 'asdf'});
    expect(response.body.page).toBe(0);
  });

  test('returns 5 jokes and corresponding size indicator when size is set as 5 in req param', async () => {
    await addJokes(11);
    const response = await getJokeWithSize(5);
    expect(response.body.content.length).toBe(5);
    expect(response.body.size).toBe(5);
  });

  test('returns 10 jokes and corresponding size indicator when size is set as 1000 in req param', async () => {
    await addJokes(11);
    const response = await getJokeWithSize(1000);
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });

  test('returns 10 jokes and corresponding size indicator when size is set as 0 in req param', async () => {
    await addJokes(11);
    const response = await getJokeWithSize(0);
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });

  test('returns page as zero and size as 10 when non number query params provided', async () => {
    await addJokes(11);
    const response = await request(app).get('/api/1.0/jokes').query({page: 'asdf', size: 'asdf'});
    expect(response.body.size).toBe(10);
    expect(response.body.page).toBe(0);
  });

  test('returns jokes to be ordered from new to old', async() => {
    await addJokes(11);
    const response = await getJokes();
    const firstHoax = response.body.content[0];
    const lastHoax = response.body.content[9];
    expect(Number(firstHoax.timestamp)).toBeGreaterThan(Number(lastHoax.timestamp));
  });

});
import request from 'supertest';
import { app } from '../app';
import { User, Auth, UserHelperModel } from '../models';
import { optionPostUser } from './UserRegister.test';
import { sequelize } from '../config/database';
import { Joke } from '../models/joke';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const emailUser1 = 'user1@gmail.com';
const passwordUser1 = 'A4GuaN@SmZ';
const content = 'Joke Content';

beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach( async () => {
  await User.destroy({where: {}});
  await Auth.destroy({where: {}});
  await Joke.destroy({where: {}});
});

afterAll(async () => {
  await sequelize.close();
});


async function postJoke(
  body: string | object | undefined = {}, 
  options: optionPostUser = {}
){

  const agent = request(app);
  let token: string | undefined = undefined;

  if (options.auth) {
    const response = await agent.post('/api/1.0/auth').send(options.auth);
    token = response.body.token;
  }

  const agent2 = request(app).post('/api/1.0/jokes');
  if (options.language) {
    agent2.set('Accept-Language', options.language);
  }

  if (token) {
    agent2.set('Authorization', `Bearer ${token}`);
  }

  if (options.token) {
    agent2.set('Authorization', `Bearer ${options.token}`);
  }
  return await agent2.send(body);
}

describe('Post Joke', () => {
  test('returns 401 when joke post request has no authentication', async () => {
    const response = await postJoke({});
    expect(response.status).toBe(401);
  });

  test.each`
  lang      | message
  ${'en'}   | ${en.unauthorizedJokeSubmit}
  ${'id'}   | ${id.unauthorizedJokeSubmit}
  `('returns error body with $message when unAuth request send with language $lang', async ({lang, message}) => {
    const nowInMS = Date.now();

    const response = await postJoke({}, {language: lang});

    const error = await response.body;

    expect(error.path).toBe('/api/1.0/jokes');
    expect(error.message).toBe(message);
    expect(error.timeStamp).toBeGreaterThan(nowInMS);
  });

  test('returns 200 when valid Hoax submitted with authorized user', async () => {
    await UserHelperModel.addMultipleNewUsers(1,0);
    const response = await postJoke(
      {content},
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );
    expect(response.status).toBe(200);
  });

  test('saves the joke to database, when authorized user sends valid request', async () => {
    await UserHelperModel.addMultipleNewUsers(1,0);
    await postJoke(
      {content},
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );
    
    const jokes = await Joke.findAll();
    expect(jokes.length).toBe(1);
  });

  test('saves joke content and timeStamp to database, when authorized user sends valid request', async () => {
    await UserHelperModel.addMultipleNewUsers(1,0);
    const beforeSubmit = Date.now();
    await postJoke(
      {content},
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );
    
    const jokes = await Joke.findAll();
    const savedJoke = jokes[0];
    expect(savedJoke.content).toBe(content);
    expect(savedJoke.timestamp).toBeGreaterThan(beforeSubmit);
    expect(savedJoke.timestamp).toBeLessThan(Date.now());
  });

  test.each`
  lang      | message
  ${'en'}   | ${en.jokeSubmitSuccess}
  ${'id'}   | ${id.jokeSubmitSuccess}
  `('returns $message to success submit when language $lang', async ({lang, message}) => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const response = await postJoke(
      {content}, 
      {
        language: lang,
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    expect(response.body.message).toBe(message);
  });


  
});
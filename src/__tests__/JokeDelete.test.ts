import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app } from '../app';
import { sequelize } from '../config/database';
import { Attachment, User, Joke, UserHelperModel} from '../models';
import { optionPostUser } from './UserRegister.test';

import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const uploadDir = process.env.uploadDir;
if (!uploadDir) {
  throw new Error('Something wrong with uploadDir in ENV');
}
const attachmentDir = 'attachment';

const attachmentFolder = path.join('.', uploadDir, attachmentDir);
const filename = `test-file-joke-delete${Date.now()}`;

const targetPath = path.join(attachmentFolder, filename);
const testFilePath = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');

beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach( async () => {
  await User.destroy({where: {}});
  if (fs.existsSync(targetPath)){
    fs.unlinkSync(targetPath);
  }
});

afterAll(async () => {
  await sequelize.close();
});

const emailUser1 = 'user1@gmail.com';
const emailUser2 = 'user2@gmail.com';
const passwordUser = 'A4GuaN@SmZ';

interface optionAuth {
  auth?: {
    email: string,
    password: string,
  },
  token?: string,
}


async function auth(options: optionAuth){
  let token: string | undefined = undefined;

  if (options.auth) {
    const response = await request(app).post('/api/1.0/auth').send(options.auth);
    token = await response.body.token;
  }

  return token;
}

async function deleteJoke(
  id = 5, 
  options: optionPostUser = {}
){
  const agent = request(app).delete(`/api/1.0/jokes/${id}`);
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }

  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }

  return await agent.send();
}

async function addJokes(userID: number) {
  const joke = await Joke.create({
    content: 'Just a simple content for test',
    timestamp: Date.now(),
    userID,
  });
  return joke;
}

async function addAttachment(jokeID: number) {
  fs.copyFileSync(testFilePath, targetPath);
  const attachment = await Attachment.create({
    filename,
    uploadDate: new Date(),
    fileType: 'image/png',
    jokeID,
  });
  return attachment;
}

describe('Delete Joke', () => {
  test('returns 403 when request is unauthorized', async () => {
    const response = await deleteJoke();
    expect(response.status).toBe(403);
  });

  test('returns 403 when token is invalid', async () => {
    const response = await deleteJoke(5, {token: 'abc'});
    expect(response.status).toBe(403);
  });

  test.each`
  language    | message
  ${'en'}     | ${en.unAuthJokeDelete}
  ${'id'}     | ${id.unAuthJokeDelete}
  `('return error body with "$message" for unauthorized request when language is "$language"', 
  async({language, message}) => {
    const nowInMS = Date.now();
    const response = await deleteJoke(5, {language});
    expect(response.body.path).toBe('/api/1.0/jokes/5');
    expect(response.body.timeStamp).toBeGreaterThan(nowInMS);
    expect(response.body.message).toBe(message);
  });

  test('returns 403 when a user tries to delete another user\'s jokes', async () => {
    const users = await UserHelperModel.addMultipleNewUsers(2,0);
    const user1 = users[0];
    const joke = await addJokes(user1.id);

    const token = await auth({auth: {
      email: emailUser2,
      password: passwordUser,
    }});

    const response = await deleteJoke(joke.id, {token});
    expect(response.status).toBe(403);
  });

  test('return 200 ok when user deletes their jokes', async() => {
    const users = await UserHelperModel.addMultipleNewUsers(1,0);
    const user1 = users[0];
    const joke = await addJokes(user1.id);

    const token = await auth({auth: {
      email: emailUser1,
      password: passwordUser,
    }});

    const response = await deleteJoke(joke.id, {token});

    expect(response.status).toBe(200);
  });

  test('removes the joke from the database when user deletes their jokes', async() => {
    const users = await UserHelperModel.addMultipleNewUsers(1,0);
    const user1 = users[0];
    const joke = await addJokes(user1.id);

    const token = await auth({auth: {
      email: emailUser1,
      password: passwordUser,
    }});

    await deleteJoke(joke.id, {token});

    const jokeInDB = await Joke.findOne({where: {
      id: joke.id,
    }});

    expect(jokeInDB).toBeNull(); 
  });

  test('removes file Attachment the database when user deletes their jokes', async() => {
    const users = await UserHelperModel.addMultipleNewUsers(1,0);
    const user1 = users[0];
    const joke = await addJokes(user1.id);
    const attachment = await addAttachment(joke.id);

    const token = await auth({auth: {
      email: emailUser1,
      password: passwordUser,
    }});

    await deleteJoke(joke.id, {token});

    const attachmentInDB = await Attachment.findOne({where: {
      id: attachment.id,
    }});

    expect(attachmentInDB).toBeNull(); 
  });

  test('removes file from the local storage when user deletes their jokes', async() => {
    const users = await UserHelperModel.addMultipleNewUsers(1,0);
    const user1 = users[0];
    const joke = await addJokes(user1.id);
    await addAttachment(joke.id);

    const token = await auth({auth: {
      email: emailUser1,
      password: passwordUser,
    }});

    await deleteJoke(joke.id, {token});

    expect(fs.existsSync(targetPath)).toBe(false);
  });
});
import request from 'supertest';
import { app } from '../app';
import path from 'path';
import { User, UserHelperModel } from '../models';
import { optionPostUser } from './UserRegister.test';
import { sequelize } from '../config/database';
import { Auth, Joke, Attachment  } from '../models';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const emailUser1 = 'user1@gmail.com';
const passwordUser1 = 'A4GuaN@SmZ';
const content = 'Joke Content';
const invalidContent = '123456789';

beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach( async () => {
  await User.destroy({where: {}});
  await Auth.destroy({where: {}});
  await Joke.destroy({where: {}});
  await Attachment.destroy({where: {}});
  // we don't have to destroy other databases, since if User is destroyed, other tables will be destroyed too.
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

interface OptionUploadFile {
  language?: string,
}

async function uploadFile(file = 'test-png.png', option: OptionUploadFile = {}) {
  const filePath = path.join('.', 'src', '__tests__', 'resources', file);
  const agent = request(app).post('/api/1.0/jokes/attachments');

  if (option.language) {
    agent.set('Accept-Language', option.language);
  }
    
  const response = await agent.attach('file', filePath);
  return response;
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

  test.each`
  lang      | message
  ${'en'}   | ${en.validationFailure}
  ${'id'}   | ${id.validationFailure}
  `('returns 400 and $message when the content less than 10 char when language $lang', async ({lang, message}) => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const response = await postJoke(
      {content: invalidContent}, 
      {
        language: lang,
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });

  test('returns validation error body when an invalid joke post by auth user', async() => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const nowInMS = Date.now();

    const response = await postJoke(
      {content: invalidContent}, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    const error = response.body;

    expect(error.timeStamp).toBeGreaterThan(nowInMS);
    expect(error.path).toBe('/api/1.0/jokes');
    expect(Object.keys(error)).toEqual(['path', 'timeStamp', 'message', 'validationErrors']);
  });

  test.each`
    lang        | content                 | contentForDesc      |message
    ${'en'}     | ${null}                 | ${null}             |${en.errorJokeContentNull}
    ${'en'}     | ${'a'.repeat(9)}        | ${'short'}          |${en.jokeContentSize}
    ${'en'}     | ${'a'.repeat(5001)}     | ${'very long'}      |${en.jokeContentSize}
    ${'id'}     | ${null}                 | ${null}             |${id.errorJokeContentNull}
    ${'id'}     | ${'a'.repeat(9)}        | ${'short'}          |${id.jokeContentSize}
    ${'id'}     | ${'a'.repeat(5001)}     | ${'very long'}      |${id.jokeContentSize}
  `('returns $message when content is $contentForDesc and language is $lang', async ({lang, content, message}) => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const response = await postJoke(
      {content: content}, 
      {
        language: lang,
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    
    expect(response.body.validationErrors.content).toBe(message);
  });

  test('stores joke owner id in database', async () => {
    const user = await UserHelperModel.addMultipleNewUsers(1,0);

    await postJoke(
      {content}, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    const jokes = await Joke.findAll();
    const joke = jokes[0];
    expect(joke.userID).toBe(user[0].id);
  });

  test('associates jokes with attachment in database', async () => {
    const uploadResponse = await uploadFile();
    const uploadedFileId = uploadResponse.body.id;


    await UserHelperModel.addMultipleNewUsers(1,0);

    await postJoke(
      {
        content,
        fileAttachment: uploadedFileId,
      }, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );


    const jokes = await Joke.findAll();

    const joke = jokes[0];

    const attachmentInDb = await Attachment.findOne({
      where: {id: uploadedFileId},
    });

    expect(attachmentInDb?.jokeID).toBe(joke.id);
  });

  test('returns 200 Ok when the attachment doesn\'t exist', async () => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const response = await postJoke(
      {
        content,
        fileAttachment: 1000,
      }, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    expect(response.status).toBe(200);
  });

  test('keeps the old associate when new Joke submitted with a new attachment ID', async () => {
    const uploadResponse = await uploadFile();
    const uploadedFileId = uploadResponse.body.id;

    await UserHelperModel.addMultipleNewUsers(1,0);

    await postJoke(
      {
        content,
        fileAttachment: uploadedFileId,
      }, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    const attachment = await Attachment.findOne({
      where: {id: uploadedFileId},
    });

    await postJoke(
      {
        content : 'Next Content Of 2',
        fileAttachment: uploadedFileId,
      }, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    const attachmentAfterSecondPost = await Attachment.findOne({
      where: {id: uploadedFileId},
    });

    expect(attachment?.jokeID).toBe(attachmentAfterSecondPost?.jokeID);
  });


});
import request from 'supertest';
import { app } from '../app';
import { User, UserHelperModel } from '../models';
import { optionPostUser } from './UserRegister.test';
import { sequelize } from '../config/database';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const emailUser1 = 'user1@gmail.com';
const passwordUser1 = 'A4GuaN@SmZ';
const randomPassword = 'JuJ*733H_SDsd@!';
const validUpdate = { username: 'user1-updated' };
const inValidUpdate = { empty: 'user1-updated' };

beforeAll( async () => {
  await sequelize.sync();
});

beforeEach( async () => {
  await User.destroy({truncate: true});
});

afterAll(async () => {
  await sequelize.close();
});

async function putUser(
  id = 5, 
  body: string | object | undefined = validUpdate, 
  options: optionPostUser = {}
){

  const agent = request(app);
  let token: string | undefined = undefined;

  if (options.auth) {
    const response = await agent.post('/api/1.0/auth').send(options.auth);
    token = response.body.token;
  }

  const agent2 = request(app).put(`/api/1.0/users/${id}`);
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

describe('User Update', () => {
  test('returns forbideen when request sent without basic auth', async() => {
    const response = await putUser();
    expect(response.status).toBe(403);
  });
  
  test.each`
  language    | message
  ${'en'}     | ${en.unauthorizedUserUpdate}
  ${'id'}     | ${id.unauthorizedUserUpdate}
  `('return error body with "$message" for unauthrized request when language is "$language"', 
  async({language, message}) => {
    const nowInMilis = new Date().getTime();
    const response = await putUser(5, undefined, {language});
    expect(response.body.path).toBe('/api/1.0/users/5');
    expect(response.body.timeStamp).toBeGreaterThan(nowInMilis);
    expect(response.body.message).toBe(message);
  });

  test('returns forbidden when request send with incorrect email in basic auth', async() => {
    await UserHelperModel.addMultipleNewUsers(1);
    const response = await putUser(5, undefined, {auth : { email: 'user100@gmail.com', password: passwordUser1}});
    expect(response.status).toBe(403);
  });

  test('returns forbidden when request send with incorrect pass in basic auth', async() => {
    await UserHelperModel.addMultipleNewUsers(1);
    const response = await putUser(5, undefined, {auth : { email : emailUser1, password: randomPassword} });
    expect(response.status).toBe(403);
  });

  test('returns forbidden when update request is sent with correct credential but for different user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(2);
    const response = await putUser(
      userList[1].id, 
      undefined, 
      {auth : { 
        email : 'user1@gmail.com', 
        password: 'A4GuaN@SmZ',
      }}
    );
    expect(response.status).toBe(403);
  });

  test('returns forbidden when update request is sent by inactive user with correct credential', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(0, 1);
    const response = await putUser(
      userList[0].id, 
      undefined, 
      {auth : { 
        email : 'user1@gmail.com', 
        password: 'A4GuaN@SmZ',
      }}
    );
    expect(response.status).toBe(403);
  });

  test('returns 200 ok when valid update request sent from authorized user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1, 0);
    const response = await putUser(
      userList[0].id, 
      validUpdate, 
      {auth : { 
        email : emailUser1, 
        password: passwordUser1,
      }}
    );

    expect(response.status).toBe(200);

  });

  test('updates username in the database when valid update request sent', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1, 0);
    const validUpdate = { username: 'user1-updated' };
    await putUser(
      userList[0].id, 
      validUpdate, 
      {auth : { 
        email : emailUser1, 
        password: passwordUser1,
      }}
    );

    const updatedUser = await UserHelperModel.getActiveUserByid(userList[0].id);
    expect(updatedUser?.username).toBe(validUpdate.username);
  });

  test('returns status 400 + validationErrors Message when the request Body is invalid', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1, 0);
    const response = await putUser(
      userList[0].id, 
      inValidUpdate, 
      {auth : { 
        email : emailUser1, 
        password: passwordUser1,
      }}
    );
    expect(response.status).toBe(400);
    expect(response.body.validationErrors.username).toBe(en.errorUsernameEmpty);
  });

  test('returns 403 when token is not valid', async() => {
    const response = await putUser(5, validUpdate, {token: '123'});
    expect(response.status).toBe(403);
  });



});
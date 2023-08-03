import request from 'supertest';
import { app } from '../app';
import { User, Auth, UserHelperModel, AuthHelperModel } from '../models';
import { optionPostUser } from './UserRegister.test';
import { sequelize } from '../config/database';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const emailUser1 = 'user1@gmail.com';
const passwordUser1 = 'A4GuaN@SmZ';

beforeAll( async () => {
  await sequelize.sync();
});

beforeEach( async () => {
  await User.destroy({truncate: true});
  await Auth.destroy({truncate: true});
});

afterAll(async () => {
  await sequelize.close();
});

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

  return await token;
}

async function deleteUser(
  id = 5, 
  options: optionPostUser = {}
){
  const agent = request(app).delete(`/api/1.0/users/${id}`);
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }

  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }

  return await agent.send();
}

describe('User Delete', () => {
  test('returns forbidden when request sent unauthorized', async() => {
    const response = await deleteUser();
    expect(response.status).toBe(403);
  });
  
  test.each`
  language    | message
  ${'en'}     | ${en.unauthorizedUserDelete}
  ${'id'}     | ${id.unauthorizedUserDelete}
  `('return error body with "$message" for unauthrized request when language is "$language"', 
  async({language, message}) => {
    const nowInMilis = new Date().getTime();
    const response = await deleteUser(5, {language});
    expect(response.body.path).toBe('/api/1.0/users/5');
    expect(response.body.timeStamp).toBeGreaterThan(nowInMilis);
    expect(response.body.message).toBe(message);
  });

  test('returns forbidden when update request is sent with correct credential but for different user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(2);
    const token = await auth({
      auth : {
        email : emailUser1, 
        password: passwordUser1,
      }});

    const response = await deleteUser(
      userList[1].id, 
      {token}
    );
    expect(response.status).toBe(403);
  });

  test('returns 403 when token is not valid', async() => {
    const response = await deleteUser(5, {token: '123'});
    expect(response.status).toBe(403);
  });

  test('returns 200 ok when valid delete request sent from authorized user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1);
    const token = await auth({
      auth: { 
        email : emailUser1, 
        password: passwordUser1,
      }});

    const response = await deleteUser(
      userList[0].id, 
      {token}
    );

    expect(response.status).toBe(200);
  });

  test('deletes user from the database when request sent from authorized user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1);
    const token = await auth({
      auth: { 
        email : emailUser1, 
        password: passwordUser1,
      }});

    await deleteUser(
      userList[0].id, 
      {token}
    );

    const updatedUser = await UserHelperModel.getActiveUserByID(userList[0].id);
    expect(updatedUser).toBeNull();
  });

  test('deletes token from the database when delete user request sent from authorized user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1);
    const token = await auth({
      auth: { 
        email : emailUser1, 
        password: passwordUser1,
      }});

    await deleteUser(
      userList[0].id, 
      {token}
    );

    if (typeof token !== 'string'){
      throw new Error('The user is not authorized');
    }

    const tokenInDM = await AuthHelperModel.findOpaqueToken(token);
    
    expect(tokenInDM).toBeNull();
  });

  test('deletes all tokens from the database when delete user request sent from authorized user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1);
    
    const token1 = await auth({
      auth: { 
        email : emailUser1, 
        password: passwordUser1,
      }});

    const token2 = await auth({
      auth: { 
        email : emailUser1, 
        password: passwordUser1,
      }});
      
    await deleteUser(
      userList[0].id, 
      {token: token1}
    );

    if (typeof token1 !== 'string' || typeof token2 !== 'string'){
      throw new Error('The user is not authorized');
    }
    
    const token1InDM = await AuthHelperModel.findOpaqueToken(token1);
    const token2InDM = await AuthHelperModel.findOpaqueToken(token2);
    
    expect(token1InDM).toBeNull();
    expect(token2InDM).toBeNull();
  });
  
});
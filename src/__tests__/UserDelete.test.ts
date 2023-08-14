import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import request from 'supertest';
import { app } from '../app';
import { User, Auth, UserHelperModel, AuthHelperModel, Attachment } from '../models';
import { optionPostUser } from './UserRegister.test';
import { sequelize } from '../config/database';
import { Joke } from '../models/joke';
import fs from 'fs';
import path from 'path';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const emailUser1 = 'user1@gmail.com';
const passwordUser1 = 'A4GuaN@SmZ';

const uploadDir = process.env.uploadDir;
if (!uploadDir) {
  throw new Error('Something wrong with uploadDir in ENV');
}

const profileDir = 'profile';
const attachmentDir = 'attachment';

const profileFolder = path.join('.', uploadDir, profileDir);
const attachmentFolder = path.join('.', uploadDir, attachmentDir);

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
  `('return error body with "$message" for unauthorized request when language is "$language"', 
  async({language, message}) => {
    const nowInMS = new Date().getTime();
    const response = await deleteUser(5, {language});
    expect(response.body.path).toBe('/api/1.0/users/5');
    expect(response.body.timeStamp).toBeGreaterThan(nowInMS);
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

  test('deletes jokes from the database when delete user request sent from authorized user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1);
    const token = await auth({
      auth: { 
        email : emailUser1, 
        password: passwordUser1,
      }});

    await request(app)
      .post('/api/1.0/jokes')
      .set('Authorization', `Bearer ${token}`)
      .send({
      content: 'Jokes Content a lot!!!',
    });

    await deleteUser(
      userList[0].id, 
      {token}
    );
    
    const jokes = await Joke.findAll();

    expect(jokes.length).toBe(0);
  });

  test('removes profile image when user is deleted ', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1);
    const user = userList[0];
    const token = await auth({
      auth: { 
        email : emailUser1, 
        password: passwordUser1,
      }});
    
    const storedFileName = 'profile-image-for-user1';
    const testFilePath = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');
    const targetPath = path.join(profileFolder, storedFileName);
    fs.copyFileSync(testFilePath, targetPath);

    user.image = storedFileName;

    await user.save();

    await deleteUser(
      user.id, 
      {token}
    );
    
    expect(fs.existsSync(targetPath)).toBe(false);
    
  });

  test('deletes jokes attachment from local storage the database when sent from authorized user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1);
    const token = await auth({
      auth: { 
        email : emailUser1, 
        password: passwordUser1,
      }});
    
    const storedFileName = 'Joke-attachment-for-user';

    const testFilePath = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');
    const targetPath = path.join(attachmentFolder, storedFileName);
    fs.copyFileSync(testFilePath, targetPath);
    
    const storedAttachment = await Attachment.create({
      filename: storedFileName,
      fileType: 'image/png',
      uploadDate: new Date(),
    });

    await request(app)
      .post('/api/1.0/jokes')
      .set('Authorization', `Bearer ${token}`)
      .send(
        {
          content: 'Jokes Content a lot!!!',
          fileAttachment: storedAttachment.id,
        }
      );

    await deleteUser(
      userList[0].id, 
      {token}
    );
    
    const storedAttachmentAfterDelete = await Attachment.findOne({where: {id: storedAttachment.id}});
    expect(storedAttachmentAfterDelete).toBeNull();

    expect(fs.existsSync(targetPath)).toBe(false);
  });
  
});
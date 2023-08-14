import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import request from 'supertest';
import path = require('path');
import { sequelize } from '../config/database';
import fs from 'fs';
import { app } from '../app';
import { Attachment } from '../models';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

if (!process.env.uploadDir) {
  throw new Error('Please set up the uploadDir environment');
}

const uploadDir = process.env.uploadDir;
const attachmentDir = 'attachment';

const attachmentFolder = path.join('.', uploadDir, attachmentDir);

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

beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach( async () => {
  await Attachment.destroy({where: {}});
});

afterAll(async () => {
  await sequelize.close();
});

describe('Upload File for Joke', () => {
  test('returns 200 ok after successful upload', async() => {
    const response = await uploadFile();
    expect(response.status).toBe(200);
  });

  test('saves dynamicFilename, uploadDate as attachment object in database', async() => {
    const beforeSubmit = Date.now();
    await uploadFile();

    const attachments = await Attachment.findAll();
    const attachment = attachments[0];
    expect(attachments.length).toBe(1);
    expect(attachment.filename).not.toBe('test-png.png');
    expect(attachment.updatedAt.getTime()).toBeGreaterThan(beforeSubmit);
  });

  test('saves file to attachment folder', async() => {
    await uploadFile();
    const attachments = await Attachment.findAll();
    const attachment = attachments[0];

    const filePath = path.join(attachmentFolder, attachment.filename );

    expect(fs.existsSync(filePath)).toBe(true);
  });

  test.each`
  file                | fileType
  ${'test-png.png'}   | ${'image/png'}
  ${'test-png'}       | ${'image/png'}
  ${'test-gif.gif'}   | ${'image/gif'}
  ${'test-jpg.jpg'}   | ${'image/jpg'}
  ${'test-pdf.pdf'}   | ${'application/pdf'}
  ${'test-txt.txt'}   | ${'UNKNOWN'}
  `('saves filetype as $fileType when this file $file is uploaded', async({file, fileType}) => {
    await uploadFile(file);

    const attachments = await Attachment.findAll();
    const attachment = attachments[0];
    expect(attachment.fileType).toBe(fileType);
  });

  test.each`
  file                | fileExtension
  ${'test-png.png'}   | ${'png'}
  ${'test-png'}       | ${'png'}
  ${'test-gif.gif'}   | ${'gif'}
  ${'test-jpg.jpg'}   | ${'jpg'}
  ${'test-pdf.pdf'}   | ${'pdf'}
  ${'test-txt.txt'}   | ${'txt'}
  `('saves filename with $fileExtension when this file $file is uploaded', async({file, fileExtension}) => {
    await uploadFile(file);

    const attachments = await Attachment.findAll();
    const attachment = attachments[0];

    const expectedResult = file === 'test-txt.txt'? false: true;

    expect(attachment.filename.endsWith(fileExtension)).toBe(expectedResult);

    const filePath = path.join(attachmentFolder, attachment.filename );
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('returns 400 when uploaded file size is bigger than 5 mb', async() => {
    const five5MB = 5 * 1024 * 1024;
    const filePath = path.join('.', 'src', '__tests__', 'resources', 'random-file');
    fs.writeFileSync(filePath, 'a'.repeat(five5MB) + 'a');
    const response = await uploadFile('random-file');
    expect(response.status).toBe(400);
    fs.unlinkSync(filePath);
  });

  test('returns 200 when uploaded file size is exactly 5 mb', async() => {
    const five5MB = 5 * 1024 * 1024;
    const filePath = path.join('.', 'src', '__tests__', 'resources', 'random-file');
    fs.writeFileSync(filePath, 'a'.repeat(five5MB));
    const response = await uploadFile('random-file');
    expect(response.status).toBe(200);
    fs.unlinkSync(filePath);
  });

  test.each`
  lang        | message
  ${'en'}     | ${en.attachmentSizeLimit}
  ${'id'}     | ${id.attachmentSizeLimit}
  `('returns $message if the attachment is >5MB and the language is $lang', async({lang, message}) => {
    const nowInMS = Date.now();
    const five5MB = 5 * 1024 * 1024;
    const filePath = path.join('.', 'src', '__tests__', 'resources', 'random-file');
    fs.writeFileSync(filePath, 'a'.repeat(five5MB) + 'a');
    const response = await uploadFile('random-file', {language: lang});
    const error = response.body;

    expect(error.path).toBe('/api/1.0/jokes/attachments');
    expect(error.message).toBe(message);
    expect(error.timeStamp).toBeGreaterThan(nowInMS);
    fs.unlinkSync(filePath);
  });

  test('returns attachment id in response', async () => {
    const response = await uploadFile();
    expect(Object.keys(response.body)).toEqual(['id']);
  });

});
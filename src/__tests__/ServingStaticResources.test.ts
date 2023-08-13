import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { app } from '../app';

const uploadDir = process.env.uploadDir;

const attachmentDir = 'attachment';
const profileDir = 'profile';

if (!uploadDir) {
  throw new Error('Please set up the uploadDir environment');
}

const filePath = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');
const storedFileName = 'test-file';
const storedAttachmentName = 'test-attachment-file';

const profileDirectory = path.join('.', uploadDir, profileDir);
const attachmentDirectory = path.join('.', uploadDir, attachmentDir);

const imageProfilePath = path.join(profileDirectory, storedFileName);
const imageProfileApiUrl = `/images/${storedFileName}`;

const attachmentPath = path.join(attachmentDirectory, storedAttachmentName);
const attachmentApiUrl = `/attachments/${storedAttachmentName}`;

async function copyFileAndSendRequest(targetPath = imageProfilePath, apiUrl = imageProfileApiUrl ) {
  fs.copyFileSync(filePath, targetPath);
  const response = await request(app).get(apiUrl);
  return response;
}


describe('Profile Images', () => {
  test('returns 404 when file not found', async() => {
    const response = await request(app).get('/images/123456');
    expect(response.status).toBe(404);
  });

  test('returns 200 when file exists', async() => {
    const response = await copyFileAndSendRequest();
    expect(response.status).toBe(200);
  });

  test('returns cached for 1 year in response', async() => {
    const response = await copyFileAndSendRequest();
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    expect(response.header['cache-control']).toContain(`max-age=${oneYearInSeconds}`);
  });
});

describe('Joke Attachments', () => {
  test('returns 404 when file not found', async() => {
    const response = await request(app).get('/attachments/123456');
    expect(response.status).toBe(404);
  });

  test('returns 200 when file exists', async() => {
    const response = await copyFileAndSendRequest(attachmentPath, attachmentApiUrl);
    expect(response.status).toBe(200);
  });

  test('returns cached for 1 year in response', async() => {
    const response = await copyFileAndSendRequest(attachmentPath, attachmentApiUrl);
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    expect(response.header['cache-control']).toContain(`max-age=${oneYearInSeconds}`);
  });
});
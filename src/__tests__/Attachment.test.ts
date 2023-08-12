import request from 'supertest';
import path = require('path');
import { sequelize } from '../config/database';
import { app } from '../app';
import { Attachment } from '../models';

const filePath = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');

async function uploadFile() {
  const response = await request(app)
    .post('/api/1.0/jokes/attachments')
    .attach('file', filePath);
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
  it('returns 200 ok after successful upload', async() => {
    const response = await uploadFile();
    expect(response.status).toBe(200);
  });

  it('saves dynamicFilename, uploadDate as attachment object in database', async() => {
    const beforeSubmit = Date.now();
    await uploadFile();

    const attachments = await Attachment.findAll();
    const attachment = attachments[0];
    expect(attachments.length).toBe(1);
    expect(attachment.filename).not.toBe('test-png.png');
    expect(attachment.updatedAt.getTime()).toBeGreaterThan(beforeSubmit);
    
  });
});
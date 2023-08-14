import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import fs from 'fs';
import path from 'path';
import { sequelize } from '../config/database';
import { FileUtils } from '../utils/file/File.util';
import { Attachment, Joke, User, UserHelperModel} from '../models';

const uploadDir = process.env.uploadDir;

const profileDir = 'profile';

const attachmentDir = 'attachment';

if (!uploadDir) {
  throw new Error('Please set up the uploadDir environment');
}
const profileFolder = path.join('.', uploadDir, profileDir);
const attachmentFolder = path.join('.', uploadDir, attachmentDir);

beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach( async () => {
  await Attachment.destroy({where: {}});
  await Joke.destroy({where: {}});
  await User.destroy({where: {}});
});

describe('createFolders' , () => {
  test('creates upload folder', () => {
    FileUtils.createFolders();
    const folderName = uploadDir;
    expect(fs.existsSync(folderName)).toBe(true);
  });

  test('creates profile folder under upload folder', () => {
    FileUtils.createFolders();
    expect(fs.existsSync(profileFolder)).toBe(true);
  });
  
  test('creates attachment folders under upload folder', () => {
    FileUtils.createFolders();
    expect(fs.existsSync(attachmentFolder)).toBe(true);
  });
});

describe('Scheduled unused attachment clean up', () => {
  const filename = `test-file${Date.now()}`;
  const testFile = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');
  const targetPath = path.join(attachmentFolder, filename);

  async function addJokes(count: number) {
    const jokeIDs = [];
    const user = await UserHelperModel.addMultipleNewUsers(count,0);
    for (let i=0; i < count; i++) {
      const joke = await Joke.create({
        content: `Content Of Great Jokes all ${i+1}`,
        timestamp: Date.now(),
        userID: user[i].id,
      });
      jokeIDs.push(joke.id);
    }
    return jokeIDs;
  }


  beforeEach(async() => {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  });

  test('removes the 24 hours old file with attachment entry if not associated in joke', async() => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const uploadDate = new Date(Date.now() - (24 * 60 * 60 * 1000) - 1 );
    const attach = await Attachment.create({
      filename: filename,
      uploadDate: uploadDate,
      fileType: 'png',
    });

    await FileUtils.removeUnusedAttachments();
    jest.advanceTimersByTime((24 * 60 * 60 * 1000) + 5000 );
    setTimeout(async () => {
      const attachmentAfterRemove = await Attachment.findOne({
        where: {
          id: attach.id,
        },
      });
      expect(attachmentAfterRemove).toBe(null);
      expect(fs.existsSync(targetPath)).toBe(false);
    }, 1000);
  });

  test('keeps the files older than 24 hours and their database entry if there\'s an association ', async() => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const id = await addJokes(1);
    const uploadDate = new Date(Date.now() - (48 * 60 * 60 * 1000) + 1);
    const attach = await Attachment.create({
      filename: filename,
      uploadDate: uploadDate,
      fileType: 'png',
      jokeID: id[0],
    });

    await FileUtils.removeUnusedAttachments();
    jest.advanceTimersByTime((24 * 60 * 60 * 1000) + 5000 );
    setTimeout(async () => {
      const attachmentAfterRemove = await Attachment.findOne({
        where: {
          id: attach.id,
        },
      });
      expect(attachmentAfterRemove).not.toBe(null);
      expect(fs.existsSync(targetPath)).toBe(true);
    }, 1000);
  });

  test('keeps files younger than 23 hours and their database entry even without association ', async() => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const uploadDate = new Date(Date.now() - (24 * 60 * 60 * 1000) );
    const attach = await Attachment.create({
      filename: filename,
      uploadDate: uploadDate,
      fileType: 'png',
    });
  
    await FileUtils.removeUnusedAttachments();
    jest.advanceTimersByTime((23 * 60 * 60 * 1000) + 5000 );
    setTimeout(async () => { 
      const attachmentAfterRemove = await Attachment.findOne({
        where: {
          id: attach.id,
        },
      });
  
      expect(attachmentAfterRemove).not.toBe(null);
      expect(fs.existsSync(targetPath)).toBe(true);
    }, 1000);
  });

  
});
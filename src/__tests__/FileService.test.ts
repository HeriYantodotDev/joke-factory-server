import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import fs from 'fs';
import path from 'path';
import { FileUtils } from '../utils/file/File.util';

const uploadDir = process.env.uploadDir;

const profileDir = 'profile';


if (!uploadDir) {
  throw new Error('Please set up the uploadDir environment');
}

describe('createFolders' , () => {
  test('creates upload folder', () => {
    FileUtils.createFolders();
    const folderName = uploadDir;
    expect(fs.existsSync(folderName)).toBe(true);

  });

  test('creates profile folder under upload folder', () => {
    FileUtils.createFolders();
    const profileFolder = path.join('.', uploadDir, profileDir);
    expect(fs.existsSync(profileFolder)).toBe(true);
  });
});
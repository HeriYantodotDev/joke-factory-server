import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import fs from 'fs';
import path from 'path';

const profileDir = 'profile';

export class FileUtils {
  public static createFolders() {

    const uploadDir = process.env.uploadDir;

    if (!uploadDir) {
      throw new Error('Please set up the uploadDir environment');
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const profileFolder = path.join('.', uploadDir, profileDir);

    if (!fs.existsSync(profileFolder)) {
      fs.mkdirSync(profileFolder);
    }
  }
}
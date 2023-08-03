import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import fs from 'fs';
import path from 'path';

import { AuthHelperModel } from '../../models';

if (!process.env.uploadDir) {
  throw new Error('Please set up the uploadDir environment');
}

const uploadDir = process.env.uploadDir;
const profileDir = 'profile';
const profileFolder = path.join('.', uploadDir, profileDir);


export class FileUtils {
  public static createFolders() {

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    if (!fs.existsSync(profileFolder)) {
      fs.mkdirSync(profileFolder);
    }
  }

  public static async saveProfileImage(base64File: string) {

    const fileName = AuthHelperModel.randomString(32);

    const filePath = path.join(profileFolder, fileName);

    await fs.promises.writeFile(filePath, base64File, 'base64');

    return fileName;
  }

}
import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';

import { Attachment, AuthHelperModel } from '../../models';

import { IdentifyFileTypeResponse } from './identifyFileType';

if (!process.env.uploadDir) {
  throw new Error('Please set up the uploadDir environment');
}

const uploadDir = process.env.uploadDir;
const profileDir = 'profile';
const attachmentDir = 'attachment';

const profileFolder = path.join('.', uploadDir, profileDir);
const attachmentFolder = path.join('.', uploadDir, attachmentDir);

export class FileUtils {
  public static createFolders() {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    if (!fs.existsSync(profileFolder)) {
      fs.mkdirSync(profileFolder);
    }

    if (!fs.existsSync(attachmentFolder)) {
      fs.mkdirSync(attachmentFolder);
    }
  }

  public static async saveProfileImage(base64File: string) {
    const fileName = AuthHelperModel.randomString(32);

    const filePath = path.join(profileFolder, fileName);

    await fs.promises.writeFile(filePath, base64File, 'base64');

    return fileName;
  }

  public static async deleteProfileImage(fileName: string) {
    const filePath = path.join(profileFolder, fileName);
    await fs.promises.unlink(filePath);
  }

  public static async saveAttachment(file: Express.Multer.File, fileIdentification: IdentifyFileTypeResponse){
    const randomString = AuthHelperModel.randomString(32);
    const filename = fileIdentification.fileExt
      ? `${randomString}.${fileIdentification.fileExt}`
      : `${randomString}`;
    const attachmentPath = path.join(attachmentFolder, filename);
    await fs.promises.writeFile(attachmentPath, file.buffer);
    return filename;
  }

  public static async removeUnusedAttachments() {
    const ONE_DAY = (24 * 60 * 60 * 1000);
    setInterval(async () => {
      const oneDayOld = new Date(Date.now() - ONE_DAY);
      const attachments = await Attachment.findAll({
        where: {
          uploadDate: {
            [Op.lt]: oneDayOld,
          },
          jokeID: {
            [Op.is]: null,
          },
        },
      });

      for (const attachment of attachments) {
        const {filename} = attachment.get({plain: true});
        await fs.promises.unlink(path.join(attachmentFolder, filename));
        await attachment.destroy();
      }
    }, ONE_DAY);
  }
}
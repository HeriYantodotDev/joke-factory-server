import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import fs from 'fs';
import path from 'path';

const uploadDir = process.env.uploadDir;

const profileDir = 'profile';

const attachmentDir = 'attachment';

if (!uploadDir) {
  throw new Error('Please set up the uploadDir environment');
}

const profileDirectory = path.join('.', uploadDir, profileDir);
const attachmentDirectory = path.join('.', uploadDir, attachmentDir);

function clearFolders(folderPath: string) {
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    fs.unlinkSync(path.join(folderPath, file));
  }
}

clearFolders(profileDirectory);
clearFolders(attachmentDirectory);

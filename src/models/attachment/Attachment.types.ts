import { Request } from 'express';

// Express.Multer.File is similar with Multer.File
export interface RequestWithFile extends Request {
  file?: Express.Multer.File
}

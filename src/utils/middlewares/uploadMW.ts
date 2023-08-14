import { RequestWithAuthenticatedUser, RequestWithFile} from '../../models';
import { Response, NextFunction } from 'express';
import multer from 'multer';
import { ErrorHandle, ErrorFileSizeLimit} from '../Errors';

const attachmentName = 'file';
const MAX_SIZE = (5 * 1024 * 1024) + 1;
const upload = multer({limits: {fileSize: MAX_SIZE} }).single(attachmentName);

export async function uploadMW(
  req: RequestWithAuthenticatedUser & RequestWithFile,
  res: Response,
  next: NextFunction
): Promise<void> {
  upload(req, res, (err) => {
    if (err) {
      ErrorHandle(new ErrorFileSizeLimit(), req, res, next);
      return;
    }
    next();
  });
}

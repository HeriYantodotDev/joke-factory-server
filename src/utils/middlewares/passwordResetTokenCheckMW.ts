import { RequestWithUser} from '../../models';
import { Response, NextFunction } from 'express';

import { UserHelperModel } from '../../models';

import { ErrorAuthForbidden } from '../Errors';

import { Locales } from '../Enum';

import { ErrorHandle } from '../Errors';

export async function passwordResetTokenCheckMW(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {

  try {
    const token = req.body.passwordResetToken;
  
    const user = await UserHelperModel.findUserBypasswordResetToken(token);
    if (!user) {
      ErrorHandle(new ErrorAuthForbidden(Locales.unauthPasswordReset), req, res, next);
      return;
    }

    req.user = user;

  // eslint-disable-next-line no-empty
  } catch (err) {
  }

  next();
}

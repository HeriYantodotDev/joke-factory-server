import { Request, Response, NextFunction } from 'express';
import { 
  ResponseAfterSuccessfulAuth, 
  User, 
  AuthHelperModel,
  UserHelperModel
} from '../../models';
import { 
  ErrorAuthFailed, 
  ErrorAuthForbidden,
  ErrorEmailNotInuse,
  ErrorSendEmailPasswordReset,
  Locales
} from '../../utils';

import { ResponsePasswordResetRequestSuccess } from '../../models';

import { sendPasswordReset } from '../../email/EmailService';

export class AuthHelperController { 
  public static async httpPostAuth(
    req: Request & {user?: User},
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        next(new ErrorAuthFailed());
        return;
      }

      const token = await AuthHelperModel.createOpaqueToken(req.user.id);
      
      const response: ResponseAfterSuccessfulAuth = {
        id: req.user.id,
        username: req.user.username,
        token,
      };
  
      res.send(response);
      return;
    }
    catch (err) {
      next(err);
    }
  }

  public static async localAuthFailure(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    if (req.flash('error')[0] === 'inactive') {
      next(new ErrorAuthForbidden());
      return;
    }
  
    next(new ErrorAuthFailed());
    return;
  }

  public static async httpLogout(
    req: Request,
    res: Response
  ): Promise<void> {
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.substring(7);
      await AuthHelperModel.deleteOpaqueToken(token);
    }
    res.send();
  }

  public static async httpPostPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      const user = await UserHelperModel.findUserByEmail(email);

      if (!user) {
        throw new ErrorEmailNotInuse();
      }

      await UserHelperModel.createPasswordResetToken(user);

      try {
        await sendPasswordReset(user);
      } catch(err) {
        throw new ErrorSendEmailPasswordReset();
      }

      const response: ResponsePasswordResetRequestSuccess = {
        message: req.t(Locales.passwordResetRequestSuccess),
      };

      res.send(response);
      
    } catch (err) {
      next(err);
    }
  }
}
import { Request, Response, NextFunction } from 'express';
import { ResponseAfterSuccessfulAuth, User, AuthHelperModel} from '../../models';
import { ErrorAuthFailed, ErrorAuthForbidden } from '../../utils';

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
}
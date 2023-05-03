import { Request, Response, NextFunction } from 'express';
import { ResponseAfterSuccessfulAuth, UserHelperModel } from '../../models';

export class AuthHelperController { 
  public static async httpPostAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const {email} = req.body;

    const user = await UserHelperModel.findUserByEmail(email);

    if (!user?.id && !user?.username) {
      throw new Error('error');
    }
    
    const response: ResponseAfterSuccessfulAuth = {
      id: user?.id,
      username: user?.username,
    };

    res.send(response);
  }
}
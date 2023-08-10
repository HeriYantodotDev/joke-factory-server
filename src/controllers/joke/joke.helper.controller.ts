import { NextFunction, Request, Response } from 'express';
import { ErrorAuthPost } from '../../utils';
import { Locales } from '../../utils';
import { RequestWithAuthenticatedUser } from '../../models';

export class JokeHelperController {
  public static async httpJokePost(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.authenticatedUser) {
        throw new ErrorAuthPost(Locales.unauthorizedJokeSubmit);
      }
      res.send();
    } catch(err) {
      next(err);
      return;
    }
  }
}
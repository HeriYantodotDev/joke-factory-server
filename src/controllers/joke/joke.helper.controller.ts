import { NextFunction, Response } from 'express';
import { RequestWithAuthenticatedUser } from '../../models';
import { JokeHelperModel } from '../../models/joke';
import { SuccessResponse } from '../../models/joke';
import { Locales } from '../../utils';
import { UserWithIDOnlyNumber } from '../../models';

export class JokeHelperController {
  public static async httpJokePost(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await JokeHelperModel.createJoke(req.body, req.authenticatedUser as UserWithIDOnlyNumber);
      const response:SuccessResponse = {
        message: req.t(Locales.jokeSubmitSuccess),
      };
      res.send(response);
    } catch(err) {
      next(err);
      return;
    }
  }
}
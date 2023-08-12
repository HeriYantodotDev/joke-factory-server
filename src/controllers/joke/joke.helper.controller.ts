import { NextFunction, Response } from 'express';
import { Locales } from '../../utils';
import { UserWithIDOnlyNumber,
  RequestWithAuthenticatedUser,
  RequestWithPagination,
  JokeHelperModel,
  SuccessResponse
} from '../../models';

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
      return;
    } catch(err) {
      next(err);
      return;
    }
  }

  public static async httpGetJokes(
    req: RequestWithPagination & RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.pagination) {
        throw new Error('Pagination is not set properly');
      }

      const { page, size } = req.pagination;
      const jokes = await JokeHelperModel.getAllJokes(page, size);

      res.status(200).send(jokes);
      return;
    } catch (err) {
      next(err);
      return;
    }
  }
}
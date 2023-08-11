import { RequestWithAuthenticatedUser} from '../../models';
import { Response, NextFunction } from 'express';
import { ErrorHandle, ErrorAuthPost } from '../Errors';
import { Locales } from '../Enum';

export async function checkAuthMWForJokeRoutes(
  req: RequestWithAuthenticatedUser,
  res: Response,
  next: NextFunction
): Promise<void> {

  if (!req.authenticatedUser) {
    ErrorHandle(new ErrorAuthPost(Locales.unauthorizedJokeSubmit), req, res, next);
    return;
  }

  next();
}

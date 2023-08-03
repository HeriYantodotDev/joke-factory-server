import { RequestWithAuthenticatedUser} from '../../models';
import { Response, NextFunction } from 'express';
import { ErrorHandle, ErrorAuthForbidden } from '../Errors';
import { Locales } from '../Enum';

export async function checkAuthMW(
  req: RequestWithAuthenticatedUser,
  res: Response,
  next: NextFunction
): Promise<void> {

  const authenticatedUser = req.authenticatedUser;
  const id = Number(req.params.id);

  if ( !authenticatedUser || authenticatedUser.id !== id ) {
    ErrorHandle(new ErrorAuthForbidden(Locales.unauthorizedUserUpdate), req, res, next);
    return;
  }

  next();
}

import { RequestWithAuthenticatedUser, UserWithIDOnly } from '../../models';
import { Response, NextFunction } from 'express';
import { verifyJWTToken } from '../tokenService';

export async function tokenAuthenticationMW(
  req: RequestWithAuthenticatedUser,
  res: Response,
  next: NextFunction
): Promise<void> {


  const authorization = req.headers.authorization;
  
  if (authorization) {
    const token = authorization.substring(7);
    try {
      const user = verifyJWTToken(token);
      if (user) {
        req.authenticatedUser = user as UserWithIDOnly;
      }
    // eslint-disable-next-line no-empty
    } catch (error) {
    }
  }

  next();
}

import { RequestWithAuthenticatedUser} from '../../models';
import { Response, NextFunction } from 'express';
import { AuthHelperModel } from '../../models';

export async function tokenAuthenticationMW(
  req: RequestWithAuthenticatedUser,
  res: Response,
  next: NextFunction
): Promise<void> {

  const authorization = req.headers.authorization;
  
  if (authorization) {
    const token = authorization.substring(7);
    try {
      const user = await AuthHelperModel.verifyOpaqueToken(token);
      if (user) {
        req.authenticatedUser = user;
      }
    // eslint-disable-next-line no-empty
    } catch (error) {
    }
  }

  next();
}

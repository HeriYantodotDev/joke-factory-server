import { Response, NextFunction } from 'express';
import { UserHelperModel } from '../../models';
import bcrypt from 'bcrypt';
import { RequestWithAuthenticatedUser } from '../../models';

export async function basicAuthenticationMW(
  req: RequestWithAuthenticatedUser,
  res: Response,
  next: NextFunction
): Promise<void> {

  const authorization = req.headers.authorization;

  if (authorization) {
    const encoded = authorization.substring(6);
    const decoded = Buffer.from(encoded, 'base64').toString('ascii');
    const [email, password] = decoded.split(':');

    const user = await UserHelperModel.findUserByEmail(email);

    if (user && !user.inactive) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.authenticatedUser = user;
      }
    }
  }

  next();
}
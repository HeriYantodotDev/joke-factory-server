import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';

const localFailureRedirect = '/api/1.0/auth/localFailure';

export function auth(strategy: string, option: object): RequestHandler {
  return function(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    passport.authenticate(strategy, option)(req, res, next);
  };
}

export const authLocal = auth('local', {
  failureRedirect: localFailureRedirect,
  failureFlash: true,
});

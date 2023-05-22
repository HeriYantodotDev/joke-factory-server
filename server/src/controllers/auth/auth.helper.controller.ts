import { Request, Response, NextFunction } from 'express';
import { ResponseAfterSuccessfulAuth, User} from '../../models';
import { ErrorAuthFailed, ErrorAuthForbidden } from '../../utils';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.jwtkey) {
  throw new Error('Please set up the JWT key in the env');
}

const jwtKey = process.env.jwtkey;

export class AuthHelperController { 
  public static async httpPostAuth(
    req: Request & {user?: User},
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {

      if (!req.user) {
        next(new ErrorAuthFailed());
        return;
      }

      const token = AuthHelperController.createJWTToken(req.user.id);
  
      const response: ResponseAfterSuccessfulAuth = {
        id: req.user.id,
        username: req.user.username,
        token,
      };
  
      res.send(response);
      return;
    }
    catch (err) {
      next(err);
    }
  }

  public static async localAuthFailure(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    if (req.flash('error')[0] === 'inactive') {
      next(new ErrorAuthForbidden());
      return;
    }
  
    next(new ErrorAuthFailed());
    return;
  }

  public static createJWTToken(id: number) {
    return jwt.sign(
      {id},
      jwtKey
    );
  }
  
}
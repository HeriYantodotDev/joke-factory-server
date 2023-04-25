import { NextFunction, Request, Response } from 'express';
import {
  UserHelperModel,
  NewUser,
  ResponseUserCreatedSuccess,
  UserDataFromDB,
  ResponseUserValidationSuccess
} from '../../models';

import { 
  ErrorUserExists,
  ErrorToken
} from '../../utils/Errors';

import { Locales } from '../../utils';

export class UserHelperController {
  public static async httpPostSignUp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const newUserData: NewUser = req.body;

    try {
      if (await UserHelperModel.userExistsByUserName(newUserData.username)) {
        throw new ErrorUserExists('username');
      }

      if (await UserHelperModel.userExistsByEmail(newUserData.email)) {
        throw new ErrorUserExists('email');
      }

      const newUser: UserDataFromDB = await UserHelperModel.createUser(newUserData);

      const responseSuccess: ResponseUserCreatedSuccess = {
        message: req.t(Locales.userCreated),
        user: newUser,
      };

      res.status(200).send(responseSuccess);
      return;
    } catch (err: unknown) {
      next(err);
      // UserHelperController.handleSignUpError(err, req, res);
      return;
    }
  }

  public static async httpActivateAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {
      const token = req.params.token;
      const user = await UserHelperModel.findUserByToken(token);
    
      if (!user) {
        throw new ErrorToken();
      } 

      await UserHelperModel.activateUser(user);
      const responseSuccess: ResponseUserValidationSuccess = {
        message: req.t('accountActivated'),
      };

      res.status(200).send(responseSuccess);
      return;
    } catch(err) {
      next(err);
      // UserHelperController.handleSignUpError(err, req, res);
      return;
    }
  }
}

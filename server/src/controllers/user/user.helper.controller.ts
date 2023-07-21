import { NextFunction, Request, Response } from 'express';
import {
  UserHelperModel,
  NewUser,
  ResponseUserCreatedSuccess,
  UserDataFromDB,
  ResponseUserValidationSuccess,
  RequestWithPagination,
  RequestWithAuthenticatedUser,
  ResponsePasswordResetRequestSuccess
} from '../../models';

import { 
  ErrorUserExists,
  ErrorToken,
  ErrorUserNotFound,
  ErrorAuthForbidden,
  ErrorEmailNotInuse,
  ErrorSendEmail
} from '../../utils/Errors';

import { Locales } from '../../utils';

import { sendPasswordReset } from '../../email/EmailService';

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
      return;
    }
  }

  public static async httpGetUsers(
    req: RequestWithPagination & RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try {
      if (!req.pagination) {
        throw new Error('Pagination is not set properly');
      }
      const authenticatedUser = req.authenticatedUser || undefined;
      const { page, size } = req.pagination;
      const users = await UserHelperModel.getAllActiveUser(page, size, authenticatedUser);

      res.status(200).send(users);
      return;
    } catch (err) {
      next(err);
      return;
    }
  }

  public static async httpGetUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {
      const id = Number(req.params.id);
      const user = await UserHelperModel.getActiveUserByIDReturnIdUserEmailOnly(id);
      if (!user) {
        throw new ErrorUserNotFound();
      }

      res.send(user);
      return;
    } catch (err) {
      next(err);
      return;
    }  
  }

  public static async httpPutUserById(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authenticatedUser = req.authenticatedUser;
      const newUserName = req.body.username;
      const id = Number(req.params.id);
      if ( !authenticatedUser || authenticatedUser.id !== id) {
        throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
      }

      await UserHelperModel.updateUserNameByID(id, newUserName);
      res.send();
    }

    catch(err) {
      next(err);
    }
  }

  public static async httpDeleteUserById(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authenticatedUser = req.authenticatedUser;
      const id = Number(req.params.id);

      if (!authenticatedUser || authenticatedUser.id !== id ) {
        throw new ErrorAuthForbidden(Locales.unauthorizedUserDelete);
      }

      await UserHelperModel.deleteUserByID(id);

      res.send();
    }

    catch(err) {
      next(err);
    }
  }

  public static async httpPostPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      const user = await UserHelperModel.findUserByEmail(email);

      if (!user) {
        throw new ErrorEmailNotInuse();
      }

      await UserHelperModel.createPasswordResetToken(user);

      try {
        await sendPasswordReset(user);
      } catch(err) {
        throw new ErrorSendEmail();
      }

      const response: ResponsePasswordResetRequestSuccess = {
        message: req.t(Locales.passwordResetRequestSuccess),
      };

      res.send(response);
      
    } catch (err) {
      next(err);
    }
  }

  public static async httpPutPasswordUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.send();
    } catch (err) {
      next(err);
    }
  }
}

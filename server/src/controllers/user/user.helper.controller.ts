import { Request, Response } from 'express';
import {
  UserHelperModel,
  NewUser,
  SIGNUP_STATUS,
  ResponseUserCreatedFailed,
  ResponseUserCreatedSuccess,
  UserDataFromDB
} from '../../models';

class UserExistsError extends Error {
  public code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export class UserHelperController {
  public static async httpPostSignUp(
    req: Request,
    res: Response
  ): Promise<void> {
    const newUserData: NewUser = req.body;

    try {
      if (await UserHelperModel.userExistsByUserName(newUserData.username)) {
        throw new UserExistsError(`Username: ${newUserData.username} already exists`, 'username');
      }

      if (await UserHelperModel.userExistsByEmail(newUserData.email)) {
        throw new UserExistsError(`Email: ${newUserData.email} already exists`, 'email');
      }

      const newUser: UserDataFromDB = await UserHelperModel.createUser(
        newUserData
      );

      const responseSuccess: ResponseUserCreatedSuccess = {
        signUpStatus: SIGNUP_STATUS.success,
        message: 'User is created',
        user: newUser,
      };

      res.status(200).send(responseSuccess);
      return;
    } catch (err: unknown) {
      UserHelperController.handleSignUpError(err, res);
      return;
    }
  }

  public static handleSignUpError(err: unknown, res: Response): void {
    let responseFailed: ResponseUserCreatedFailed;
    if ( !(err instanceof Error)) {
      responseFailed = {
        signUpStatus: SIGNUP_STATUS.failed,
        message: 'Unknown Error',
      };
      res.status(400).send(responseFailed);
      return;
    }

    if (err instanceof UserExistsError) {
      const field = err.code;

      const validationErrors: Record<string,string> = {};
      validationErrors[field] = err.message;
      res.status(400).send({
        signUpStatus: SIGNUP_STATUS.failed,
        message: err.message,
        validationErrors,
      });
      return;
    }

    responseFailed = {
      signUpStatus: SIGNUP_STATUS.failed,
      message: err.message,
    };
    res.status(400).send(responseFailed);
    return;
  }
}

import { Request, Response } from 'express';
import {
  UserHelperModel,
  NewUser,
  SIGNUP_STATUS,
  ResponseUserCreatedFailed,
  ResponseUserCreatedSuccess,
  UserDataFromDB,
  SendAccountActivationFailed
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
        throw new UserExistsError('errorUserExist', 'username');
      }

      if (await UserHelperModel.userExistsByEmail(newUserData.email)) {
        throw new UserExistsError('errorUserExist', 'email');
      }

      const newUser: UserDataFromDB = await UserHelperModel.createUser(newUserData);

      const responseSuccess: ResponseUserCreatedSuccess = {
        signUpStatus: SIGNUP_STATUS.success,
        message: req.t('userCreated'),
        user: newUser,
      };

      res.status(200).send(responseSuccess);
      return;
    } catch (err: unknown) {
      UserHelperController.handleSignUpError(err, req, res);
      return;
    }
  }

  public static handleSignUpError(err: unknown, req: Request, res: Response): void {
    let responseFailed: ResponseUserCreatedFailed;

    if (err instanceof SendAccountActivationFailed){
      responseFailed = {
        signUpStatus: SIGNUP_STATUS.failed,
        message: req.t(err.message),
      };

      res.status(err.code).send(responseFailed);
      return;
    }

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

      const message = req.t(err.message);

      const errorMess: string = UserHelperController.generateErrorUserExist(field, req.body[field], message);

      const validationErrors: Record<string,string> = {};
      validationErrors[field] = errorMess;
      res.status(400).send({
        signUpStatus: SIGNUP_STATUS.failed,
        message: errorMess,
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

  public static generateErrorUserExist(field: string,  value: string, errorType: string): string {
    return `${field}: ${value} ${errorType}`;
  }
}

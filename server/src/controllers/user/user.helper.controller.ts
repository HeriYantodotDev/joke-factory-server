import { Request, Response } from 'express';
import {
  UserHelperModel,
  NewUser,
  SIGNUP_STATUS,
  ResponseUserCreatedFailed,
  ResponseUserCreatedSuccess,
  UserDataFromDB
} from '../../models';
import { signUpValidator } from '../../utils';

export class UserHelperController {
  public static async httpPostSignUp(
    req: Request,
    res: Response
  ): Promise<void> {
    
    const newUserData: NewUser = req.body;

    //body validation
    signUpValidator.validate(newUserData);

    if (signUpValidator.error && signUpValidator.errorMessage) {
      const responseError: ResponseUserCreatedFailed = {
        signUpStatus: SIGNUP_STATUS.failed,
        message: signUpValidator.errorMessage,
      };

      res.status(400).send(responseError);
      return;
    }
    //End of body validation
    try {
      if (await UserHelperModel.userExists(newUserData.email)) {
        throw new Error(`Email: ${newUserData.email} already exists`);
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

    responseFailed = {
      signUpStatus: SIGNUP_STATUS.failed,
      message: err.message,
    };
    res.status(400).send(responseFailed);
    return;
  }
}

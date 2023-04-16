import { Request, Response } from 'express';
import {
  UserHelperModel,
  NewUser,
  SIGNUP_STATUS,
  ResponseUserCreatedFailed,
  ResponseUserCreatedSuccess,
} from '../../models';
import { signUpValidator } from '../../utils';
import bcrypt from 'bcrypt';

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

    const userWithHash = await UserHelperController.createUserWithHash(
      newUserData
    );

    const newUser = await UserHelperModel.createUser(userWithHash);

    const responseSuccess: ResponseUserCreatedSuccess = {
      signUpStatus: SIGNUP_STATUS.success,
      message: 'User is created',
      user: newUser,
    };

    res.status(200).send(responseSuccess);
  }

  private static async createUserWithHash(
    newUserData: NewUser
  ): Promise<NewUser> {
    const hash = await UserHelperController.hashPassword(newUserData.password);

    const userWithHash: NewUser = { ...newUserData, password: hash };

    return userWithHash;
  }

  private static async hashPassword(plainTextPass: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainTextPass, saltRounds);
    return hash;
  }
}

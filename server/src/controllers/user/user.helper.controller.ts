import { Request, Response } from 'express';
import { createUser, NewUser } from '../../models';
import { signUpValidator } from '../../utils';

export async function httpPostSignUp(
  req: Request,
  res: Response
): Promise<void> {
  const newUserData: NewUser = req.body;

  // //TODO : Body Validation
  signUpValidator.validate(newUserData);

  if (signUpValidator.error) {
    res.status(401).send({
      signUpStatus: 'failed',
      message: signUpValidator.errorMessage,
    });
    return;
  }

  const newUser = await createUser(newUserData);

  res.status(200).send({
    signUpStatus: 'success',
    message: 'User is created',
  });
  return;
}

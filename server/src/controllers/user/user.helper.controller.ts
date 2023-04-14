import { Request, Response } from 'express';
import { createUser, NewUser } from '../../models';
import { signUpValidator } from '../../utils';
import bcrypt from 'bcrypt';

export async function httpPostSignUp(
  req: Request,
  res: Response
): Promise<void> {
  const newUserData: NewUser = req.body;
  //body validation
  signUpValidator.validate(newUserData);

  if (signUpValidator.error) {
    res.status(400).send({
      signUpStatus: 'failed',
      message: signUpValidator.errorMessage,
    });
    return;
  }
  //End of body validation

  const userWithHash = await createUserwithHash(newUserData);

  const newUser = await createUser(userWithHash);

  res.status(200).send({
    signUpStatus: 'success',
    message: 'User is created',
    user: newUser,
  });
}

async function createUserwithHash(newUserData: NewUser) {
  const hash = await hashPassword(newUserData.password);

  const userWithHash = { ...newUserData, password: hash };

  return userWithHash;
}

async function hashPassword(plainTextPass: string): Promise<string> {
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainTextPass, saltRounds);
  return hash;
}

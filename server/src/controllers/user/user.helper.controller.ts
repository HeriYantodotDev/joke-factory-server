import { Request, Response } from 'express';
import { createUser, NewUser } from '../../models';

export async function httpPostSignUp(
  req: Request,
  res: Response
): Promise<void> {
  const newUserData: NewUser = req.body;
  //TODO : Body Validation
  const newUser = await createUser(newUserData);

  res.status(200).send({
    message: 'User is created',
  });
  return;
}

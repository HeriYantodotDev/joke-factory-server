import { Request, Response } from 'express';
import { routerConfig, post } from '../../decorators';
import { httpPostSignUp } from './user.helper.controller';

@routerConfig('/api/1.0')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserController {
  @post('/users')
  async httpPostSignUpController(req: Request, res: Response): Promise<void> {
    await httpPostSignUp(req, res);
  }
}

import { Request, Response } from 'express';
import { routerConfig, post } from '../../decorators';

@routerConfig('/v1')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpController {
  @post('/users')
  postSignUp(req: Request, res: Response) {
    res.status(200).send({
      message: 'User is created',
    });
  }
}

import { routerConfig, post } from '../../decorators';
import { UserHelperController } from './user.helper.controller';

@routerConfig('/api/1.0')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserController {
  @post('/users', UserHelperController.httpPostSignUp)
  handleSignUpRequest(): void {}
}

import { routerConfig, post, use } from '../../decorators';
import { UserHelperController } from './user.helper.controller';
import { bodyValidatorMW, signUpSchema, signUpValidationErrorGenerator } from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserController {
  @post('/users', UserHelperController.httpPostSignUp)
  @use(bodyValidatorMW(signUpSchema, signUpValidationErrorGenerator, validationOption))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleSignUpRequest(): void {}
}

/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { routerConfig, post, get,  use } from '../../decorators';

import { AuthHelperController } from './auth.helper.controller';

import { bodyValidatorMW
} from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/auth')
class AuthController {
  @post('/', AuthHelperController.httpPostAuth)
  authPost(): void {}
  // @use(bodyValidatorMW(signUpSchema, signUpValidationErrorGenerator, validationOption))
  
}

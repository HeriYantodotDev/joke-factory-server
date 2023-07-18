/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { routerConfig, post, get,  use } from '../../decorators';

import { AuthHelperController } from './auth.helper.controller';

import { 
  authLocal, 
  bodyValidatorMW, 
  loginSchema, 
  validationErrorGenerator,
  passwordResetSchema
} from '../../utils';
import { RequestHandler } from 'express';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/auth')
class AuthController {
  @post('/', AuthHelperController.httpPostAuth as RequestHandler)
  @use(authLocal)
  @use(bodyValidatorMW(loginSchema, validationErrorGenerator, validationOption))
  authPost(): void {}

  @get('/localFailure', AuthHelperController.localAuthFailure)
  localFailure(): void {}
}

@routerConfig('/api/1.0/logout')
class AuthLogout {
  @post('/', AuthHelperController.httpLogout)
  logout(): void {}
}


@routerConfig('/api/1.0/password-reset')
class PasswordReset {
  @post('/', AuthHelperController.httpPostPasswordReset)
  @use(bodyValidatorMW(passwordResetSchema, validationErrorGenerator, validationOption))
  resetPassword(): void {}
}

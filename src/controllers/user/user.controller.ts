/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { RequestHandler } from 'express';
import { routerConfig, post, get, use, put, del } from '../../decorators';
import { UserHelperController } from './user.helper.controller';
import { bodyValidatorMW, 
  signUpSchema, 
  validationErrorGenerator,
  paginationMW,
  userUpdateSchema,
  passwordResetSchema,
  passwordUpdateSchema,
  checkAuthMW
} from '../../utils';


import { passwordResetTokenCheckMW } from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/users')
class UsersController {
  @post('/', UserHelperController.httpPostSignUp)
  @use(bodyValidatorMW(signUpSchema, validationErrorGenerator, validationOption))
  usersPost(): void {}
  
  @post('/token/:token', UserHelperController.httpActivateAccount )
  usersTokenParams():void{}

  @get('/', UserHelperController.httpGetUsers)
  @use(paginationMW)
  usersGet(): void {}
  
  @get('/:id', UserHelperController.httpGetUserById)
  userGetById(): void {}

  @put('/:id', UserHelperController.httpPutUserById )
  @use(bodyValidatorMW(userUpdateSchema, validationErrorGenerator, validationOption))
  @use(checkAuthMW)
  userPutById(): void {}

  @del('/:id', UserHelperController.httpDeleteUserById)
  userDeleteById(): void{}
}

@routerConfig('/api/1.0/user')
class UserController {
  @post('/password', UserHelperController.httpPostPasswordReset)
  @use(bodyValidatorMW(passwordResetSchema, validationErrorGenerator, validationOption))
  resetPassword(): void {}

  @put('/password', UserHelperController.httpPutPasswordUpdate as RequestHandler)
  @use(bodyValidatorMW(passwordUpdateSchema, validationErrorGenerator, validationOption))
  @use(passwordResetTokenCheckMW as RequestHandler)
  passwordUpdate(): void {}
}

/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { routerConfig, post, get, use, put, del } from '../../decorators';
import { UserHelperController } from './user.helper.controller';
import { bodyValidatorMW, 
  signUpSchema, 
  validationErrorGenerator,
  paginationMW,
  userUpdateSchema,
  passwordResetSchema
} from '../../utils';

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
  userPutById(): void {}

  @del('/:id', UserHelperController.httpDeleteUserById)
  userDeleteById(): void{}
}

@routerConfig('/api/1.0/user')
class UserController {
  @post('/password-reset', UserHelperController.httpPostPasswordReset)
  @use(bodyValidatorMW(passwordResetSchema, validationErrorGenerator, validationOption))
  resetPassword(): void {}
}

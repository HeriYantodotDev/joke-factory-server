/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { routerConfig, post, get, use, put, del } from '../../decorators';
import { UserHelperController } from './user.helper.controller';
import { bodyValidatorMW, 
  signUpSchema, 
  validationErrorGenerator,
  paginationMW,
  basicAuthenticationMW,
  userUpdateSchema,
  tokenAuthenticationMW
} from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/users')
class UserController {
  @post('/', UserHelperController.httpPostSignUp)
  @use(bodyValidatorMW(signUpSchema, validationErrorGenerator, validationOption))
  usersPost(): void {}
  
  @post('/token/:token', UserHelperController.httpActivateAccount )
  usersTokenParams():void{}

  @get('/', UserHelperController.httpGetUsers)
  @use(tokenAuthenticationMW)
  @use(paginationMW)
  usersGet(): void {}

  @get('/:id', UserHelperController.httpGetUserById)
  userGetById(): void {}

  @put('/:id', UserHelperController.httpPutUserById )
  @use(tokenAuthenticationMW)
  @use(bodyValidatorMW(userUpdateSchema, validationErrorGenerator, validationOption))
  userPutById(): void {}

  @del('/:id', UserHelperController.httpDeleteUserById)
  @use(tokenAuthenticationMW)
  userDeleteById(): void{}
}

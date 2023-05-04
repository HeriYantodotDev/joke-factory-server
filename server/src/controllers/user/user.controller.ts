/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { routerConfig, post, get,  use } from '../../decorators';
import { UserHelperController } from './user.helper.controller';
import { bodyValidatorMW, 
  signUpSchema, 
  signUpValidationErrorGenerator,
  paginationMW 
} from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/users')
class UserController {
  @post('/', UserHelperController.httpPostSignUp)
  @use(bodyValidatorMW(signUpSchema, signUpValidationErrorGenerator, validationOption))
  usersPost(): void {}
  
  @post('/token/:token', UserHelperController.httpActivateAccount )
  usersTokenParams():void{}

  @get('/', UserHelperController.httpGetUsers)
  @use(paginationMW)
  usersGet(): void {}

  @get('/:id', UserHelperController.httpGetUserById)
  userGetById(): void {}
}

/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { post, get, use, routerConfig } from '../../decorators'; 
import { JokeHelperController } from './joke.helper.controller';
import { checkAuthMWForJokeRoutes,
  jokePostSchema,
  validationErrorGenerator,
  bodyValidatorMW,
  paginationMW
} from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/jokes')
class JokesController {
  @post('/', JokeHelperController.httpJokePost)
  @use(bodyValidatorMW(jokePostSchema, validationErrorGenerator, validationOption))
  @use(checkAuthMWForJokeRoutes)
  jokesPost(): void{}

  @get('/', JokeHelperController.httpGetJokes)
  @use(paginationMW)
  jokesGet(): void{}
}

@routerConfig('/api/1.0/users/:userID/jokes')
class JokeController {
  @get('/', JokeHelperController.httpGetUserJokes)
  @use(paginationMW)
  jokeGet():void{}
}
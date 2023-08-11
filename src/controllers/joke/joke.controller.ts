/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { post, use, routerConfig } from '../../decorators'; 
import { JokeHelperController } from './joke.helper.controller';
import { checkAuthMWForJokeRoutes } from '../../utils/middlewares/checkAuthMWForJokeRoutes';

@routerConfig('/api/1.0/jokes')
class JokesController {
  @post('/', JokeHelperController.httpJokePost)
  @use(checkAuthMWForJokeRoutes)
  jokesPost(): void{}
}
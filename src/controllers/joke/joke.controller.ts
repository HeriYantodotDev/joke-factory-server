/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { post, routerConfig } from '../../decorators'; 
import { JokeHelperController } from './joke.helper.controller';

@routerConfig('/api/1.0/jokes')
class JokesController {
  @post('/', JokeHelperController.httpJokePost)
  jokesPost(): void{}
}
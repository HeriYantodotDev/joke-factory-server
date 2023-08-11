import { Joke } from './Joke.model';
import { 
  BodyRequestHttpPostJokeType,
  JokeObjectType 
} from './Joke.types';
import { UserWithIDOnlyNumber } from '../user';

export class JokeHelperModel {
  public static async createJoke(
    body: BodyRequestHttpPostJokeType,
    user: UserWithIDOnlyNumber
  ) {
    const joke: JokeObjectType = {
      content: body.content,
      timestamp: Date.now(),
      userID: user.id,
    }
    
    await Joke.create(joke);
  }
}
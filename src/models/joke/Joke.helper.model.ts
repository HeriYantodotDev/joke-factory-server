import { Joke } from './Joke.model';
import { 
  BodyRequestHttpPostJokeType,
  JokeObjectType 
} from './Joke.types';

export class JokeHelperModel {
  public static async createJoke(body: BodyRequestHttpPostJokeType) {
    const joke: JokeObjectType = {
      content: body.content,
      timestamp: Date.now(),
    }
    
    await Joke.create(joke);
  }
}
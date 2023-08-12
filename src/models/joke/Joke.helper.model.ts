import { Joke } from './Joke.model';
import { 
  BodyRequestHttpPostJokeType,
  JokeObjectType,
  JokePaginationResponseTypes,
  JokeContentResponseTypes
} from './Joke.types';
import { User, UserWithIDOnlyNumber } from '../user';


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

  public static async getAllJokes(
    page: number, 
    size: number, 
  ): Promise<JokePaginationResponseTypes>{

    const jokeList = await Joke.findAndCountAll({
      attributes: ['id', 'content', 'timestamp'],
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'image']
      },
      order: [['id', 'DESC']],
      limit: size,
      offset: page * size,
    });

    const totalPages = JokeHelperModel.getPageCount( jokeList.count, size);

    return JokeHelperModel.generateResUserPagination(jokeList.rows as unknown as JokeContentResponseTypes[], totalPages, page, size);
  }

  public static getPageCount(userCount: number, size: number): number {
    return Math.ceil(userCount / size);
  }

  public static generateResUserPagination(
    jokeList: JokeContentResponseTypes[], 
    totalPages: number, 
    page: number,
    size: number
  ): JokePaginationResponseTypes {
    return {
      content: jokeList,
      page,
      size,
      totalPages,
    };
  }
}
import { Joke } from './Joke.model';
import { Attachment, AttachmentHelperModel } from '../attachment';
import { 
  BodyRequestHttpPostJokeType,
  JokeObjectType,
  JokePaginationResponseTypes,
  JokeContentResponseForClientTypes,
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
    
    const {id} = await Joke.create(joke);
    if (body.fileAttachment) {
      await AttachmentHelperModel.associateAttachmentToJoke(body.fileAttachment, id);
    }
  }

  public static async getAllJokes(
    page: number, 
    size: number,
    userID: number | null = null,
  ): Promise<JokePaginationResponseTypes>{

    let whereClause = {};
    if (userID) {
      whereClause = {
        userID
      }
    }

    const jokeList = await Joke.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'content', 'timestamp'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'image'],
        },
        {
          model: Attachment,
          as: 'attachment',
          attributes: ['filename', 'fileType']
        }
      ],
      order: [['id', 'DESC']],
      limit: size,
      offset: page * size,
    });

    const totalPages = JokeHelperModel.getPageCount( jokeList.count, size);

    const properJokeList = JokeHelperModel.generateJokeList(jokeList.rows);

    return JokeHelperModel.generateResUserPagination(
      properJokeList as unknown as JokeContentResponseForClientTypes[], 
      totalPages, 
      page, 
      size
    );
  }

  public static getPageCount(userCount: number, size: number): number {
    return Math.ceil(userCount / size);
  }

  public static generateJokeList(jokeList: Joke[]) {

    const newContent = jokeList.map((joke) => {
      const jokeAsJSON = joke.get({plain: true}) as any;
      if (jokeAsJSON.attachment === null) {
        delete jokeAsJSON.attachment;
      }

      if (jokeAsJSON.attachment) {
        jokeAsJSON.fileAttachment = jokeAsJSON.attachment;
        delete jokeAsJSON.attachment;
      }

      return jokeAsJSON;
    });

    return newContent; 
  }

  public static generateResUserPagination(
    jokeList: JokeContentResponseForClientTypes[], 
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
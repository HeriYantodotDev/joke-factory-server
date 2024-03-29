import { NextFunction, Response } from 'express';
import { Locales } from '../../utils';
import { UserWithIDOnlyNumber,
  RequestWithAuthenticatedUser,
  RequestWithPagination,
  JokeHelperModel,
  SuccessResponse,
  UserHelperModel,
  AttachmentHelperModel,
  RequestWithFile
} from '../../models';
import { ErrorUserNotFound, ErrorAuthForbidden } from '../../utils';

export class JokeHelperController {

  public static async httpJokePost(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await JokeHelperModel.createJoke(req.body, req.authenticatedUser as UserWithIDOnlyNumber);
      const response:SuccessResponse = {
        message: req.t(Locales.jokeSubmitSuccess),
      };
      res.send(response);
      return;
    } catch(err) {
      next(err);
      return;
    }
  }

  public static async httpGetJokes(
    req: RequestWithPagination & RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.pagination) {
        throw new Error('Pagination is not set properly');
      }

      const { page, size } = req.pagination;
      const jokes = await JokeHelperModel.getAllJokes(page, size);

      res.status(200).send(jokes);
      return;
    } catch (err) {
      next(err);
      return;
    }
  }

  public static async httpGetUserJokes(
    req: RequestWithPagination & RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userID = Number(req.params.userID);
      const userExist = await UserHelperModel.getActiveUserByID(userID);

      if (!userExist) {
        throw new ErrorUserNotFound();
      }

      if (!req.pagination) {
        throw new Error('Pagination is not set properly');
      }

      const { page, size } = req.pagination;
      const jokes = await JokeHelperModel.getAllJokes(page, size, userID);

      res.status(200).send(jokes);

      return;

    } catch (err) {
      next(err);
      return;
    }
  }

  public static async httpJokeAttachmentPost(
    req: RequestWithAuthenticatedUser & RequestWithFile,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new Error('Something wrong with the Multer Module, please check it');
      }
  
      const attachmentObject = await AttachmentHelperModel.createAttachment(req.file);
      res.send(attachmentObject);
      return;
    }
    catch (err) {
      next(err);
      return;
    }
  }

  public static async httpDeleteJokeById(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authenticatedUser = req.authenticatedUser;
      const jokeID = Number(req.params.jokeID);

      if (!authenticatedUser || !authenticatedUser?.id) {
        throw new ErrorAuthForbidden(Locales.unAuthJokeDelete);
      }
      
      await JokeHelperModel.checkAndDeleteJoke(jokeID, authenticatedUser.id);

      res.send();

    } catch (err) {
      next(err);
    }
  }
}
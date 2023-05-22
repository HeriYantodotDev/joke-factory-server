import crypto from 'crypto';
import { Auth } from './Auth.model';

export class AuthHelperModel {
  public static randomString(length: number) {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  public static async createOpaqueToken(id: number) {
    const token = AuthHelperModel.randomString(32);
    await Auth.create({
      token,
      userID: id,
    });

    return token;
  }

  public static async verifyOpaqueToken(token: string) {
    const tokenInDB = await Auth.findOne({where: {token: token}});
    const userID = tokenInDB?.userID;

    return {id: userID};
  }
}
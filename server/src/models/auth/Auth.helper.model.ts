import crypto from 'crypto';
import { Auth } from './Auth.model';
import { Op } from 'sequelize';

export class AuthHelperModel {
  public static randomString(length: number) {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  public static async createOpaqueToken(id: number) {
    const token = AuthHelperModel.randomString(32);
    await Auth.create({
      token,
      userID: id,
      lastUsedAt: new Date(),
    });
    
    return token;
  }

  public static async verifyOpaqueToken(token: string) {
    const maxAge = this.maxAgeTokenByDay(7);

    const tokenInDB = await Auth.findOne({
      where: {
        token: token,
        lastUsedAt: {
          [Op.gt]: maxAge,
        },
      }});

    if (tokenInDB) {
      await tokenInDB.update({
        lastUsedAt: new Date(),
      });
      await tokenInDB.save();
    }

    const userID = tokenInDB?.userID;

    return {id: userID};
  }

  public static async findOpaqueToken(token: string) {
    return await Auth.findOne({where: {token}});
  }

  public static async deleteOpaqueToken(token: string){
    await Auth.destroy({where: {token}});
  }

  private static maxAgeTokenByDay(day: number){
    return new Date(Date.now() - (day * 24 * 60 * 60 * 1000));
  }

}
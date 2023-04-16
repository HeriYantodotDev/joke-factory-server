import { User } from './user.model';
import { NewUser, UserDataFromDB } from './user.types';

export class UserHelperModel {
  public static async createUser(newUser: NewUser): Promise<UserDataFromDB> {
    const user = await User.create(newUser);
    const { id, username, email } = user.dataValues;
    return { id, username, email };
  }
}

import { User } from './User.model';
import { NewUser, UserDataFromDB } from './user.types';

export class UserHelperModel {
  public static async createUser(newUser: NewUser): Promise<UserDataFromDB> {
    const user: User = await User.create(newUser);
    const { id, username, email } = user;
    return { id, username, email };
  }
}

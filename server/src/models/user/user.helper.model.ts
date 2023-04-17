import { User } from './User.model';
import { NewUser, UserDataFromDB } from './user.types';
import bcrypt from 'bcrypt';

export class UserHelperModel {
  public static async createUser(newUser: NewUser): Promise<UserDataFromDB> {
    const userWithHash = await UserHelperModel.createUserWithHash(newUser);

    const user: User = await User.create(userWithHash);

    const { id, username, email } = user;

    return { id, username, email };
  }

  private static async createUserWithHash(
    newUserData: NewUser
  ): Promise<NewUser> {
    const hash = await UserHelperModel.hashPassword(newUserData.password);

    const userWithHash: NewUser = { ...newUserData, password: hash };

    return userWithHash;
  }

  private static async hashPassword(plainTextPass: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainTextPass, saltRounds);
    return hash;
  }

  public static async userExists(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email: email } });
    return !!user; 
  }
}

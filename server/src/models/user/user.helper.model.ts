import { User } from './User.model';
import { NewUser, UserDataFromDB } from './user.types';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendAccountActivation } from '../../email/EmailService';

export class UserHelperModel {
  public static async createUser(newUser: NewUser): Promise<UserDataFromDB> {
    const userWithHash = await UserHelperModel.createUserWithHash(newUser);

    const userWithHashAndToken = UserHelperModel.createUserWithHashAndToken(userWithHash);

    const user: User = await User.create(userWithHashAndToken);

    await sendAccountActivation(user);

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

  private static createUserWithHashAndToken(userWithhash: NewUser): NewUser{
    return { ...userWithhash, activationToken: UserHelperModel.generateToken(16) };
  }

  private static async hashPassword(plainTextPass: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainTextPass, saltRounds);
    return hash;
  }

  public static async userExistsByEmail(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email: email } });
    return !!user; 
  }

  public static async userExistsByUserName(username: string): Promise<boolean> {
    const user = await User.findOne({ where: { username: username } });
    return !!user; 
  }

  private static generateToken(length: number) {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }
}

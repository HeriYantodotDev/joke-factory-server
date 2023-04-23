import { User } from './User.model';
import { NewUser, UserDataFromDB } from './user.types';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {sendAccountActivation} from '../../email/EmailService'; 
import { sequelize } from '../../config/database';

export class SendAccountActivationFailed extends Error {
  public code: number;
  constructor(message: string) {
    super(message);
    this.code = 502;
  }
}

export class UserHelperModel {
  public static async createUser(newUser: NewUser): Promise<UserDataFromDB> {
    const userWithHash = await UserHelperModel.createUserWithHash(newUser);

    const userWithHashAndToken = UserHelperModel.createUserWithHashAndToken(userWithHash);

    const transaction = await sequelize.transaction();

    const user: User = await User.create(userWithHashAndToken, {transaction});

    try {
      await sendAccountActivation(user);
    } catch (err) {
      await transaction.rollback();
      throw new SendAccountActivationFailed('emailFailure');
    }

    await transaction.commit();
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

  public static async findUserByToken(token: string): Promise<User | null> {
    return await User.findOne({where: {activationToken: token}});
  }

  public static async activateUser(user: User): Promise<void>{
    user.set({
      inactive: false,
      activationToken: '',
    });
    await user.save();
    console.log(user.activationToken);
  }

}

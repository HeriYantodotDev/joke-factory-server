import { User } from './User.model';
import { NewUser, UserDataFromDB, UserPagination } from './user.types';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {sendAccountActivation} from '../../email/EmailService'; 
import { sequelize } from '../../config/database';
import { ErrorSendEmailActivation } from '../../utils/Errors';

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
      throw new ErrorSendEmailActivation();
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
  }

  public static async getAllActiveUser(page: number, size: number): Promise<UserPagination>{
    const userList = await User.findAndCountAll({
      where: { inactive: false },
      attributes: ['id', 'username', 'email'],
      limit: size,
      offset: page * size,
    });

    const totalPages = UserHelperModel.getPageCount(userList.count, size);

    return await UserHelperModel.generateResUserPagination(userList.rows, totalPages, page, size);
  }

  public static getPageCount(userCount: number, size: number): number {
    return Math.ceil(userCount / size);
  }

  public static async generateResUserPagination(
    userList: User[], 
    totalPages: number, 
    page: number,
    size: number
  ): Promise<UserPagination> {
    return {
      content: userList,
      page,
      size,
      totalPages,
    };
  }

  public static async addMultipleNewUsers(activeUserAccount: number, inactiveUserAccount = 0): Promise<User[]> {
    const userList: User[] = [];
    for (let i=0; i < (activeUserAccount+inactiveUserAccount); i++) {
      const newUser: NewUser = {
        username: `user${i+1}`,
        email: `user${i+1}@gmail.com`,
        password: 'A4GuaN@SmZ',
        inactive: i >= activeUserAccount,
      };
      const user =  await User.create(newUser);
      userList.push(user);
    }
    return userList;
  }

  public static async getUserByID(idParams: number): Promise<UserDataFromDB | null> {
    const user = await User.findOne({
      where: {
        id: idParams,
        inactive: false,
      },
    });

    if (!user) {
      return null;
    }

    const { id, username, email } = user;
    return { id, username, email };
  }


}

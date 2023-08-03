import { User } from './User.model';
import { NewUser, 
  UserDataFromDB, 
  UserPagination,
  UserWithIDOnly,
  ExpectedRequestBodyhttpPutUserById
} from './user.types';
import bcrypt from 'bcrypt';
import {sendAccountActivation} from '../../email/EmailService'; 
import { sequelize } from '../../config/database';
import { ErrorSendEmail } from '../../utils/Errors';
import { ErrorUserNotFound } from '../../utils/Errors';
import { Op, WhereOptions, InferAttributes } from 'sequelize';
import { AuthHelperModel } from '../auth';
import { FileUtils } from '../../utils/file/File.util';

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
      throw new ErrorSendEmail();
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
    return { ...userWithhash, activationToken: AuthHelperModel.randomString(16) };
  }

  private static async hashPassword(plainTextPass: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainTextPass, saltRounds);
    return hash;
  }

  public static async userExistsByEmail(email: string): Promise<boolean> {
    return !!(await UserHelperModel.findUserByEmail(email));
  }

  public static async findUserByEmail(email: string): Promise<User | null> {
    const user = await User.findOne({ where: { email: email } });
    return user;
  }

  public static async userExistsByUserName(username: string): Promise<boolean> {
    return !!(await UserHelperModel.findUserByUserName(username));
  }

  public static async findUserByUserName(username: string): Promise<User | null> {
    const user = await User.findOne({ where: { username: username } });
    return user;
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

  public static async getAllActiveUser(
    page: number, 
    size: number, 
    authenticatedUser: User | UserWithIDOnly | undefined
  ): Promise<UserPagination>{

    const whereClause = UserHelperModel.whereClauseForGetAllActiveUser(authenticatedUser);

    const userList = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'username', 'email', 'image'],
      limit: size,
      offset: page * size,
    });

    const totalPages = UserHelperModel.getPageCount( userList.count, size);

    return UserHelperModel.generateResUserPagination(userList.rows, totalPages, page, size);
  }

  public static whereClauseForGetAllActiveUser(authenticatedUser: User | UserWithIDOnly | undefined) {
    const  whereClause: WhereOptions<InferAttributes<User, { omit: never }>> | undefined = {
      inactive: false,
    };

    if (authenticatedUser?.id !== undefined) {
      whereClause.id = { [Op.not]: authenticatedUser.id };
    }

    return whereClause;
  }

  public static getPageCount(userCount: number, size: number): number {
    return Math.ceil(userCount / size);
  }

  public static generateResUserPagination(
    userList: User[], 
    totalPages: number, 
    page: number,
    size: number
  ): UserPagination {
    return {
      content: userList,
      page,
      size,
      totalPages,
    };
  }

  public static async addMultipleNewUsers(activeUserAccount: number, inactiveUserAccount = 0): Promise<User[]> {
    const userList: User[] = [];
    const password = await UserHelperModel.hashPassword('A4GuaN@SmZ');
    for (let i=0; i < (activeUserAccount+inactiveUserAccount); i++) {
      const newUser: NewUser = {
        username: `user${i+1}`,
        email: `user${i+1}@gmail.com`,
        password,
        inactive: i >= activeUserAccount,
    };
      const user =  await User.create(newUser);
      userList.push(user);
    }
    return userList;
  }

  public static async getActiveUserByID(idParams: number): Promise<User | null> {
    return await User.findOne({
      where: {
        id: idParams,
        inactive: false,
      },
    });
  }

  public static async getActiveUserByIDReturnIdUserEmailImageOnly(
    idParams: number
  ): Promise<UserDataFromDB | null> {
    const user = await UserHelperModel.getActiveUserByID(idParams);

    if (!user) {
      return null;
    }

    const { id, username, email, image } = user;
    return { id, username, email, image };
  }

  public static async updateUserByID(
    idParams: number, 
    body: ExpectedRequestBodyhttpPutUserById
  ): Promise<UserDataFromDB> {
    const user = await this.getActiveUserByID(idParams);

    if (!user) {
      throw new ErrorUserNotFound();
    }

    if (body.image) {
      if (user.image) {
        await FileUtils.deleteProfileImage(user.image);
      }

      const fileName = await FileUtils.saveProfileImage(body.image);
      user.image = fileName;
    }

    user.username = body.username;

    await user.save();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      image: user.image,
    };
  }

  public static async deleteUserByID(idParams: number) {
    const user = await this.getActiveUserByID(idParams);

    if (!user) {
      throw new ErrorUserNotFound();
    }

    await user.destroy();
  }

  public static async createPasswordResetToken(user: User) {
    user.passwordResetToken = AuthHelperModel.randomString(16);
    await user.save();
  }

  public static async findUserBypasswordResetToken(token: string) {
    return await User.findOne({
      where: {
        passwordResetToken: token,
      },
    });
  }

  public static async updatePassword(user: User, newPassword: string) {
    const newHashPassword = await this.hashPassword(newPassword);
    user.set({
      password: newHashPassword,
      passwordResetToken: '',
      inactive: false,
      activationToken: '',
    });

    await user.save();

    await AuthHelperModel.destroyAllTokensByUserId(user.id);
  }

}

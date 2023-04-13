// prettier-ignore
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from 'sequelize';

import { sequelize } from '../../config/database';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare username: string;
  declare email: string;
  declare password: string;
}

User.init(
  {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: 'user',
  }
);

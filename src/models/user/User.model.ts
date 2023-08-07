import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';

import { sequelize } from '../../config/database';

import { Auth } from '../auth';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare inactive: CreationOptional<boolean>;
  declare activationToken: CreationOptional<string>;
  declare passwordResetToken: CreationOptional<string>;
  declare image: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: DataTypes.STRING,
    inactive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    activationToken: DataTypes.STRING,
    passwordResetToken: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    image: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: 'user',
  }
);

User.hasMany(Auth, {
  onDelete: 'cascade',
  foreignKey: 'userID',
});

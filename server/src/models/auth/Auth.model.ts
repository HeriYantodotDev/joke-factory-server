import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey
} from 'sequelize';

import { sequelize } from '../../config/database';

export class Auth extends Model<
  InferAttributes<Auth>,
  InferCreationAttributes<Auth>
> {
  declare id: CreationOptional<number>;
  declare token: string;
  declare userID: ForeignKey<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Auth.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
    },
    userID: {
      type: DataTypes.INTEGER,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'auth',
  }
);



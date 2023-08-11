import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';

import { sequelize } from '../../config/database';

export class Joke extends Model<
  InferAttributes<Joke>,
  InferCreationAttributes<Joke>
> {
  declare id: CreationOptional<number>;
  declare content: string;
  declare timestamp: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Joke.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING,
    },
    timestamp: DataTypes.BIGINT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'joke',
  }
);

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey
} from 'sequelize';

import { sequelize } from '../../config/database';

import { Attachment } from '../attachment';

export class Joke extends Model<
  InferAttributes<Joke>,
  InferCreationAttributes<Joke>
> {
  declare id: CreationOptional<number>;
  declare content: string;
  declare timestamp: CreationOptional<number>;
  declare userID: ForeignKey<number>;
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
    userID: {
      type: DataTypes.INTEGER,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'joke',
  }
);

Joke.hasOne(Attachment, {
  onDelete: 'cascade',
  foreignKey: 'jokeID'
})

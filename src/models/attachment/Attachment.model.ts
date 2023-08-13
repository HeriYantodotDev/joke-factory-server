import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey
} from 'sequelize';

import { sequelize } from '../../config/database';

export class Attachment extends Model<
  InferAttributes<Attachment>,
  InferCreationAttributes<Attachment>
> {
  declare id: CreationOptional<number>;
  declare filename: string;
  declare uploadDate: Date;
  declare fileType: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Attachment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: DataTypes.STRING,
    uploadDate: DataTypes.DATE,
    fileType: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'attachment',
  }
);

import dotenv from 'dotenv';
dotenv.config();

import { Sequelize, Dialect } from 'sequelize';

const DBUSER = process.env.DBUSER;
const DBPASS = process.env.DBPASS;
const DBNAME = process.env.DBNAME;

const dialect: Dialect = 'sqlite';

const sequalizeOptions = {
  dialect: dialect,
  storage: './database.sqlite',
  logging: false,
};

if (!DBUSER || !DBPASS || !DBNAME) {
  throw new Error('Please set up credential for database');
}

export const sequelize = new Sequelize(
  DBNAME,
  DBUSER,
  DBPASS,
  sequalizeOptions
);

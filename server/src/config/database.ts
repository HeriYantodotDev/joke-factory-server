import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});

import { Sequelize, Dialect } from 'sequelize';

const mapDialect: {[key: string]: Dialect} = {
  mysql: 'mysql',
  postgres: 'postgres',
  sqlite: 'sqlite',
  mariadb: 'mariadb',
  mssql: 'mssql',
  db2: 'db2',
  snowflake: 'snowflake',
  oracle: 'oracle',
};

if (!process.env.dialect) {
  throw new Error(
    'Please set up credential for database in the env(dialect is not set)'
  );
}

const dialect = mapDialect[process.env.dialect];

const {username, password, database, storage, logging} = process.env;

if (
  !username || 
  !password || 
  !database || 
  !storage || 
  !logging 
) {
  throw new Error(
    'Please set up credential for database in the env'
  );
}

const loggingBoolean = logging === 'true';

const sequalizeOptions = {
  dialect,
  storage,
  logging: loggingBoolean,
};

export const sequelize = new Sequelize(
  database,
  username,
  password,
  sequalizeOptions
);

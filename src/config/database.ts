import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});

import { Sequelize } from 'sequelize';

import pg from 'pg';

pg.defaults.parseInt8 = true;

const databaseURL = process.env.databaseURL;

const logging = process.env.logging;

const loggingBoolean = logging === 'true';

if ( !databaseURL ) {
  throw new Error(
    'Please set up credential for database in the env'
  );
}

export const sequelize = new Sequelize(
  databaseURL,
  {
    logging: loggingBoolean,
  }
);

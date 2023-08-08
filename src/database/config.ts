import dotenv from 'dotenv';
const environment = process.env.NODE_ENV as string;
dotenv.config({path: `.env.${process.env.NODE_ENV}`});

const dialect = process.env.dialect;

if (environment === 'test' || environment === 'development') {
  const storage = process.env.storage;
  module.exports = {
    [environment as string]: {
      dialect: dialect,
      storage: storage,
    },
  };
}

if (environment === 'staging' || environment === 'production' ) {
  const url = process.env.databaseURL;
  module.exports = {
    [environment as string]: {
      dialect: dialect,
      url: url,
    },
  };
}
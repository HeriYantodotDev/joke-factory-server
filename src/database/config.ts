import dotenv from 'dotenv';
const environment = process.env.NODE_ENV as string;
dotenv.config({path: `.env.${process.env.NODE_ENV}`});

const dialect = process.env.dialect;

if (process.env.NODE_ENV !== 'production') {
  const storage = process.env.storage;
  module.exports = {
    [environment as string]: {
      dialect: dialect,
      storage: storage,
    },
  };
}
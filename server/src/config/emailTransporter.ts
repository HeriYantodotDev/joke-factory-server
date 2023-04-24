import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import nodemailer from 'nodemailer';

const configSTring = process.env.transporter_config;
if (!configSTring) {
  throw new Error(
    'Please set up configuration for Email transport'
  );
}

const config = JSON.parse(configSTring);

export const transporter = nodemailer.createTransport(config);

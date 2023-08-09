import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import { createLogger, transports, format } from 'winston';

const environment = process.env.NODE_ENV;

if (!environment) {
  throw new Error('Please set up the environment dev either in CLI or ENV doc');
}

const customFormat = format.combine(
  format.timestamp(),
  format.printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase().padEnd(7)}] : ${info.message}`;
  })
);

const consoleTransport = new transports.Console();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const destinations: any[] = [consoleTransport];

// const fileTransport = new transports.File({filename: 'app.log'});
// if (environment === 'production') {
//   destinations.push(fileTransport);
// }

export const logger = createLogger({
  transports: destinations,
  level: 'debug',
  format: customFormat,
  silent: environment === 'test' || environment === 'staging',
});

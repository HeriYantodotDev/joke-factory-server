import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 8585,
  tls: {
    rejectUnauthorized: false,
  },
});
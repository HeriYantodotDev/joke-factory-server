import { transporter } from '../config/emailTransporter';
import { User } from '../models';
import nodemailer from 'nodemailer';
import { logger } from '../utils';

export async function sendAccountActivation(user: User): Promise<void | Error> {
  const response = await transporter.sendMail({
    from: 'Joke Factory <hello@jokefactory>',
    to: user.email,
    subject: 'Account Activation',
    html: `
    <div>
      Please click link below to active the account
    <div>
    <div>
      <a href="http://localhost:8080/#/login?token=${user.activationToken}">Activate Account</a>
    <div>
      `,
  });

  if (process.env.NODE_ENV === 'development') {
    logger.info(nodemailer.getTestMessageUrl(response));
  }
}

export async function sendPasswordReset(user: User): Promise<void | Error> {
  const response = await transporter.sendMail({
    from: 'Joke Factory <hello@jokefactory>',
    to: user.email,
    subject: 'Password Reset',
    html: `
    <div>
      Please click link below to reset your password
    <div>
    <div>
      <a href="http://localhost:8080/#/password-reset?reset=${user.passwordResetToken}">Reset</a>
    <div>
      `,
  });

  if (process.env.NODE_ENV === 'development') {
    logger.info(nodemailer.getTestMessageUrl(response));
  }
}

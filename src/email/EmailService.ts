import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import { transporter } from '../config/emailTransporter';
import { User } from '../models';
import { logger } from '../utils';

const frontEndURL = process.env.frontEndURL || 'http://localhost:8080' ;
const email = process.env.email || 'justtest@mail.com';

export async function sendAccountActivation(user: User): Promise<void | Error> {

  const linkActivation = `${frontEndURL}/#/login?token=${user.activationToken}`;

  await transporter.sendMail({
    from: email,
    to: user.email,
    subject: 'Account Activation',
    html: `
    <h1>
      Joke Factory - Activation Account
    </h1>
    <p>
      Hi! Welcome to my fun project app: "Joke Factory".
    </p>
    <div>
      Please click link below to activate the account
    </div>
    <div>
      <a href=${linkActivation}">Activate Account</a>
    </div>
      `,
  });

  logger.info(linkActivation);
}

export async function sendPasswordReset(user: User): Promise<void | Error> {

  const link = `${frontEndURL}/#/password-reset?reset=${user.passwordResetToken}`;
  await transporter.sendMail({
    from: email,
    to: user.email,
    subject: 'Password Reset',
    html: `
    <h1>
      Joke Factory - Password Reset
    </h1>
    <div>
      Please click link below to reset your password
    </div>
    <div>
      <a href=${link}>Reset</a>
    </div>
      `,
  });

  logger.info(link);
}

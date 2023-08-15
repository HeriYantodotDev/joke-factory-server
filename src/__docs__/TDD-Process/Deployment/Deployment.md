# Deployment

## Production Configuration

In our current app, we're using node mailer, however in real life we have to use a real mail server. In the [NodeMailer](https://nodemailer.com/about/), we can use a popular mail service like Google. 

Please check the configuration here: [configuration](https://www.freecodecamp.org/news/use-nodemailer-to-send-emails-from-your-node-js-server/#:~:text=Nodemailer%E2%80%99s%20API%20is%20pretty%20simple%20and%20requires%20us,a%20MailOptions%20Object%203%20Use%20the%20Transporter.sendMail%20method)

Also please read this : [oauth2](https://nodemailer.com/smtp/oauth2/)

Instead of using oauth2, I think I'll go with the simple one by using App Password: 
- Go to the gmail setting
- Activate 2 Factor Authentication
- After it's activated, go to App Password, and set the password. 

Then update the transporter_config in the `.env.production`:

Like this object: 

```
{
  service: "gmail",
  auth: {
    user: "xxx@gmail.com",
    pass: "--your--app--password"
  }
}
```

Change it into JSON file and put it in the `transporter_config`

Remember that the `from` should be the real email: 
So, then in the production environment please put the real email, and change the configuration. Also adding the frontEndURL, to ensure when we deploy the frontEnd, the URL will dynamically changed to the correct URL instead of localhost: 

```
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
    <h1>
    <p>
      Hi Welcome to my fun project app, Joke Factory.
    </p>
    <div>
      Please click link below to active the account
    <div>
    <div>
      <a href=${linkActivation}">Activate Account</a>
    <div>
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
    <h1>
    <div>
      Please click link below to reset your password
    <div>
    <div>
      <a href=${link}>Reset</a>
    <div>
      `,
  });

  logger.info(link);
}
```

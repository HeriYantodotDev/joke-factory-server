import { transporter } from '../config/emailTransporter';
import { User } from '../models';

export async function sendAccountActivation(user: User) {
  await transporter.sendMail({
    from: 'Joke Factory <hello@jokefactory>',
    to: user.email,
    subject: 'Account Activation',
    html: `Token is ${user.activationToken}`,
  });
}


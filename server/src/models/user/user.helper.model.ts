import { User } from './user.model';

export interface NewUser {
  username: string;
  email: string;
  password: string;
}

export async function createUser(newUser: NewUser) {
  const user = await User.create(newUser);
  return user;
}

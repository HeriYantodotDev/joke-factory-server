export interface NewUser {
  username: string;
  email: string;
  password: string;
}

export interface UserDataFromDB {
  id: number;
  username: string;
  email: string;
}

export enum SIGNUP_STATUS {
  failed = 'failed',
  success = 'success',
}

export interface ResponseUserCreatedSuccess {
  signUpStatus: SIGNUP_STATUS.success;
  message: 'User is created';
  user: UserDataFromDB;
}

export interface ResponseUserCreatedFailed {
  signUpStatus: SIGNUP_STATUS.failed;
  message: string;
}

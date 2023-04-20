export interface NewUser {
  [key: string]: string | boolean | undefined,
  username: string,
  email: string,
  password: string,
  inactive?: boolean,
  activationToken?: string,
}

export interface UserDataFromDB {
  id: number,
  username: string,
  email: string,
}

export enum SIGNUP_STATUS {
  failed = 'failed',
  success = 'success',
}

//In the frontend here's how it looks :
export interface ResponseUserCreatedFailedFrontEnd {
  validationErrors?: {
    username?: string,
    email?: string,
    password?: string,
  },
}

export interface ResponseUserCreatedSuccess {
  signUpStatus: SIGNUP_STATUS.success,
  message: string,
  user: UserDataFromDB,
}

export interface ResponseUserCreatedFailed extends ResponseUserCreatedFailedFrontEnd {
  signUpStatus: SIGNUP_STATUS.failed,
  message: string,
}

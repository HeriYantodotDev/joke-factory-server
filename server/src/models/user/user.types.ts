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

export interface ValidationErrorResponse {
  validationErrors?: {
    username?: string,
    email?: string,
    password?: string,
  },
}

export interface ErrorResponse extends ValidationErrorResponse {
  message: string,
  path?: string,
  timeStamp?: number,
}

export interface ResponseUserCreatedSuccess {
  message: string,
  user: UserDataFromDB,
}

export interface ResponseUserValidationSuccess {
  message: string,
}

import { Request } from 'express';
import { User } from './User.model';

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

export interface UserPagination {
  content: UserDataFromDB[],
  page: number,
  size: number,
  totalPages: number,
}

export interface RequestWithPagination extends Request {
  pagination?: {
    page: number,
    size: number,
  },
}
//do we need this?
export interface UserWithIDOnly {
  id: number | undefined,
}

export interface RequestWithAuthenticatedUser extends Request {
  authenticatedUser?: UserWithIDOnly,
}

export interface RequestWithUser extends Request {
  user?: User,
}

export interface CredentialBody {
  email: string,
  password: string,
}

export interface ResponseAfterSuccessfulAuth {
  id: number,
  username: string,
  token: string,
}

import { Joke } from './Joke.model';

export interface BodyRequestHttpPostJokeType {
  content: string,
  fileAttachment?: number,
}

export interface JokeObjectType {
  content: string,
  timestamp: number,
  userID: number,
}

export interface SuccessResponse {
  message: string
}

export interface JokePaginationResponseTypes {
  content: JokeContentResponseForClientTypes[],
  page: number,
  size: number,
  totalPages: number,
}

export interface JokeContentResponseForClientTypes {
  id: number,
  content: string,
  timestamp: number,
  user: {
    id: number,
    username: string,
    email: string,
    image: string,
  }
  fileAttachment?: {
    filename: string,
    fileType: string,
  }
}
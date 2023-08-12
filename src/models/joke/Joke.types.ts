import { Joke } from './Joke.model';

export interface BodyRequestHttpPostJokeType {
  content: string,
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
  content: JokeContentResponseTypes[],
  page: number,
  size: number,
  totalPages: number,
}

export interface JokeContentResponseTypes {
  id: number,
  content: string,
  timestamp: number,
  user: {
    id: number,
    username: string,
    email: string,
    image: string,
  }
}
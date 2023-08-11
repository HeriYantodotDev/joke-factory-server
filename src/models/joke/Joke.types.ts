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
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.jwtkey) {
  throw new Error('Please set up the JWT key in the env');
}

const jwtKey = process.env.jwtkey;

export function verifyJWTToken(token: string) {
  return jwt.verify(token, jwtKey);
}

import { RequestHandler } from 'express';
import { MetadataKeys } from './constant';

/* eslint-disable @typescript-eslint/no-unused-vars */
export function use(middleware: RequestHandler) {
  return function (target: object, key: string, desc: PropertyDescriptor) {
    const middlewares = Reflect.getMetadata(
      MetadataKeys.middleware, 
      target, key
      ) || [];

    Reflect.defineMetadata(
      MetadataKeys.middleware,
      [...middlewares, middleware],
      target,
      key
    );
  };
}

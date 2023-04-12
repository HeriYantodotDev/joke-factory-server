import { RequestHandler } from 'express';
import { MetadataKeys } from './constant';

// prettier-ignore
export function use(middleware: RequestHandler) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  return function (target: any, key: string, desc: PropertyDescriptor) {
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

import 'reflect-metadata';

import { Method, MetadataKeys } from './constant';
import { RequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/ban-types
function routerBinder(method: string): Function {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (path: string, controller: RequestHandler): Function {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    return function (target: any, key: string, desc: PropertyDescriptor): void {
      Reflect.defineMetadata(MetadataKeys.path, path, target, key);
      Reflect.defineMetadata(MetadataKeys.method, method, target, key);
      Reflect.defineMetadata(MetadataKeys.controller, controller, target, key);
    };
  };
}

export const get = routerBinder(Method.get);
export const post = routerBinder(Method.post);
export const put = routerBinder(Method.put);
export const del = routerBinder(Method.del);
export const patch = routerBinder(Method.patch);

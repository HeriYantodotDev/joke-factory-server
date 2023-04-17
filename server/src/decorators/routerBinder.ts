import 'reflect-metadata';

import { Method, MetadataKeys } from './constant';
import { RequestHandler } from 'express';

interface DecoratorFunction {
  (path: string, controller: RequestHandler): DefineMetadataFunction,
}

interface DefineMetadataFunction {
  (target: object, key: string, desc: PropertyDescriptor): void,
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function routerBinder(method: string): DecoratorFunction {
  return function (
    path: string, 
    controller: RequestHandler
  ): DefineMetadataFunction {
    return function (
      target: object, 
      key: string, 
      _desc: PropertyDescriptor
    ): void {
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

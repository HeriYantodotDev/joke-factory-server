import 'reflect-metadata';
import { AppRouter } from '../AppRouter';
import { Method, MetadataKeys } from './constant';
import { RequestHandler } from 'express';

interface RouterConfigFunction {
  (target: {prototype: object} ): void,
}

export function routerConfig(routePrefix: string): RouterConfigFunction{
  return function (target: {prototype: object}) : void {
    const router = AppRouter.router;

    const keys = Object.getOwnPropertyNames(target.prototype);

    for (const key of keys) {
      if (key === 'constructor') {
        continue;
      }

      const path = Reflect.getMetadata(
        MetadataKeys.path,
        target.prototype,
        key
      );

      const method: Method = Reflect.getMetadata(
        MetadataKeys.method,
        target.prototype,
        key
      );

      const controller: RequestHandler = Reflect.getMetadata(
        MetadataKeys.controller,
        target.prototype,
        key
      );

      const middlewares =
        Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) ||
        [];

      if (path) {
        router[method](
          `${routePrefix}${path}`,
          ...middlewares,
          controller
        );
      }
    }
  };
}

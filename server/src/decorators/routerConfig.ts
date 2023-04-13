import 'reflect-metadata';
import { AppRouter } from '../AppRouter';
import { Method, MetadataKeys } from './constant';

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/ban-types
export function routerConfig(routePrefix: string): (target: Function) => void {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function): void {
    const router = AppRouter.router;

    const keys = Object.getOwnPropertyNames(target.prototype);

    for (const key of keys) {
      if (key === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

      const routerController = descriptor?.value;

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

      const middlewares =
        Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) ||
        [];

      if (path) {
        router[method](
          `${routePrefix}${path}`,
          ...middlewares,
          routerController
        );
      }
    }
  };
}

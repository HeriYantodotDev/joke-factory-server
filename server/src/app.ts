import express from 'express';

import { AppRouter } from './AppRouter';

import './controllers/index';

import { checkingJSONRequest } from './utils';

export const app = express();

class startupMiddleware {
  static configMiddleware(): void {
    this.configBodyParser();
  }

  private static configBodyParser(): void {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(checkingJSONRequest());
  }
}

class Routers {
  static setUpAllRouters(): void {
    this.configRouters();
  }

  private static configRouters(): void {
    app.use(AppRouter.router);
  }
}

startupMiddleware.configMiddleware();
Routers.setUpAllRouters();

console.log(`Environment : ${process.env.NODE_ENV}`);

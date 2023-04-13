import express from 'express';

import { AppRouter } from './AppRouter';

import './controllers/index';

export const app = express();

class startupMiddleware {
  static configMiddleware(): void {
    this.configBodyParser();
  }

  private static configBodyParser(): void {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
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

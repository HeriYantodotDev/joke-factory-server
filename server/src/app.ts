import express from 'express';

import { AppRouter } from './AppRouter';

import './controllers/index';

import { checkingJSONRequest } from './utils';

import i18next from 'i18next';
import Backend  from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

import { ErrorHandle } from './utils/Errors';

export const app = express();

class startupMiddleware {
  static configMiddleware(): void {
    this.configBodyParser();
    this.configi18Next();
  }

  private static configBodyParser(): void {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(checkingJSONRequest());
  }

  private static configi18Next(): void {
    i18next
      .use(Backend)
      .use(middleware.LanguageDetector)
      .init({
        fallbackLng: 'en',
        lng: 'en',
        ns: ['translation'],
        defaultNS: 'translation',
        backend: {
          loadPath: './locales/{{lng}}/{{ns}}.json',
        },
        detection: {
          lookupHeader: 'accept-language',
        },
      });

    app.use(middleware.handle(i18next));
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

class Errors {
  static setUpErrorHandle(): void {
    this.configErrorHandle();
  }

  private static configErrorHandle(): void {
    app.use(ErrorHandle);
  }
}

startupMiddleware.configMiddleware();
Routers.setUpAllRouters();
Errors.setUpErrorHandle();

console.log(`Environment : ${process.env.NODE_ENV}`);

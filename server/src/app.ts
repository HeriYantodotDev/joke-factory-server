import express from 'express';

import { AppRouter } from './AppRouter';

import './controllers/index';

import { checkingJSONRequest } from './utils';

import i18next from 'i18next';
import Backend  from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

import { ErrorHandle } from './utils/Errors';

import passport from 'passport';
import { Strategy as LocalStrategy, IVerifyOptions } from 'passport-local';

import bcrypt from 'bcrypt';

import { UserHelperModel, User, UserDataFromDB} from './models';

import session from 'express-session';

import flash from 'connect-flash';

import { tokenAuthenticationMW } from './utils';

export const app = express();

const LOCAL_OPTIONS = {
  usernameField: 'email',
  passwordField: 'password',
};

class startupMiddleware {
  static configMiddleware(): void {
    this.configBodyParser();
    this.configTokenMW();
    this.configi18Next();
    this.configPassport();
    this.enableSession();
    this.enableFlash();
    this.enablePassport();
  }

  private static configBodyParser(): void {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(checkingJSONRequest());
  }

  private static configTokenMW(): void {
    app.use(tokenAuthenticationMW);
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
          loadPath: './src/locales/{{lng}}/{{ns}}.json',
        },
        detection: {
          lookupHeader: 'accept-language',
        },
      });

    app.use(middleware.handle(i18next));
  }

  private static configPassport() {
    passport.use(new LocalStrategy(LOCAL_OPTIONS, this.verifyUserLocally));
    this.saveAndReadSessionFromCookie();
  }

  private static async verifyUserLocally(
    email: string, 
    password: string, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: Express.User | false, options?: IVerifyOptions) => void
  ) {
    const existingUser = await UserHelperModel.findUserByEmail(email);

    if (!existingUser) {

      done(null, false);
      return;
    }

    if (existingUser.inactive === true) {
      done(null, false, {message: 'inactive'});
      return;
    }
    
    bcrypt.compare(password, existingUser.password, (err, isMatch) => {
      if (err) {
        return done(err);
      }
      if (isMatch) {
        // If password is correct, call done with user object
        const userFromDB: UserDataFromDB = {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
        };

        return done(null, userFromDB);
      } else {
        // If password is incorrect, call done with false and error message
        return done(null, false);
      }
    });
  }

  private static enablePassport() {
    app.use(passport.initialize());
    app.use(passport.session());
  }  

  private static saveAndReadSessionFromCookie() {

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      if (user) {
        done(null, user);
      } else {
        done(null, undefined);
      }
    });

  }

  private static enableSession() {
    app.use(session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false,
    }));
  }

  private static enableFlash(){
    app.use(flash());
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

// eslint-disable-next-line no-console
console.log(`Environment : ${process.env.NODE_ENV}`);

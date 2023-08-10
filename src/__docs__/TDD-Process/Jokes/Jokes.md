# Jokes

## Submitting Jokes

Now it's time to create functionality for the users to create contents. 

Let's get started by testing and defining the new route

- Let's create our first test
  ```
  import request from 'supertest';
  import { app } from '../app';

  function postJoke(body:  string | object | undefined) {
    return (request(app).post('/api/1.0/jokes').send(body));
  }

  describe('Post Joke', () => {
    test('returns 401 when joke post request has no authentication', async () => {
      const response = await postJoke({});
      expect(response.status).toBe(401);
    });
  });
  ```
- Now let's define our new route by creating a folder named `joke` under the `controllers` and then create two files: `joke.controller.ts` and also `joke.helper.controller.ts`. Next don't forget to import and export anything to the index.ts in the `controllers` folder.
  `joke.controller.ts`
  ```
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  import { post, routerConfig } from '../../decorators'; 
  import { JokeHelperController } from './joke.helper.controller';

  @routerConfig('/api/1.0/jokes')
  class JokesController {
    @post('/', JokeHelperController.httpJokePost)
    jokesPost(): void{}
  }
  ```

  ```
  import { NextFunction, Request, Response } from 'express';

  export class JokeHelperController {
    public static async httpJokePost(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      res.status(401).send();
    }
  }
  ```

Great now we pass our first test. Next let's test & create a functionality for error message : 
  - test
    ```
    describe('Post Joke', () => {
      test('returns 401 when joke post request has no authentication', async () => {
        const response = await postJoke({});
        expect(response.status).toBe(401);
      });

      test.each`
      lang      | message
      ${'en'}   | ${en.unauthorizedJokeSubmit}
      ${'id'}   | ${id.unauthorizedJokeSubmit}
      `('returns error body with $message when unAuth request send with language $lang', async ({lang, message}) => {
        const nowInMS = Date.now();

        const response = await postJoke({}, {language: lang});

        const error = await response.body;

        expect(error.path).toBe('/api/1.0/jokes');
        expect(error.message).toBe(message);
        expect(error.timeStamp).toBeGreaterThan(nowInMS);

      });
    ```
  - Implementation
    For the implementation, let's set up the translation and Locale first using this key `unauthorizedJokeSubmit`
    Then let's create an error class and put that error class to the `ErrorHandle` function under the `ErrorGroupSimple`:
    ```
    export class ErrorAuthPost extends Error {
      public code = 401;
      constructor(message: string) {
        super(message);
      }
    }
    ```
    Great. Now here's the implementation: 
    ```
    public static async httpJokePost(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        throw new ErrorAuthPost(Locales.unauthorizedJokeSubmit);
      } catch(err) {
        next(err);
        return;
      }
    }
    ```

And we're passing our test. Next, we're going to send a request with a valid body, and also authentication. Here's the full test: 
- test
  ```
  import request from 'supertest';
  import { app } from '../app';
  import { User, Auth, UserHelperModel } from '../models';
  import { optionPostUser } from './UserRegister.test';
  import { sequelize } from '../config/database';
  import en from '../locales/en/translation.json';
  import id from '../locales/id/translation.json';
  const emailUser1 = 'user1@gmail.com';
  const passwordUser1 = 'A4GuaN@SmZ';

  beforeAll( async () => {
    if (process.env.NODE_ENV === 'test') {
      await sequelize.sync();
    }
  });

  beforeEach( async () => {
    await User.destroy({where: {}});
    await Auth.destroy({where: {}});
  });

  afterAll(async () => {
    await sequelize.close();
  });


  async function postJoke(
    body: string | object | undefined = {}, 
    options: optionPostUser = {}
  ){

    const agent = request(app);
    let token: string | undefined = undefined;

    if (options.auth) {
      const response = await agent.post('/api/1.0/auth').send(options.auth);
      token = response.body.token;
    }

    const agent2 = request(app).post('/api/1.0/jokes');
    if (options.language) {
      agent2.set('Accept-Language', options.language);
    }

    if (token) {
      agent2.set('Authorization', `Bearer ${token}`);
    }

    if (options.token) {
      agent2.set('Authorization', `Bearer ${options.token}`);
    }
    return await agent2.send(body);
  }

  describe('Post Joke', () => {
    test('returns 401 when joke post request has no authentication', async () => {
      const response = await postJoke({});
      expect(response.status).toBe(401);
    });

    test.each`
    lang      | message
    ${'en'}   | ${en.unauthorizedJokeSubmit}
    ${'id'}   | ${id.unauthorizedJokeSubmit}
    `('returns error body with $message when unAuth request send with language $lang', async ({lang, message}) => {
      const nowInMS = Date.now();

      const response = await postJoke({}, {language: lang});

      const error = await response.body;

      expect(error.path).toBe('/api/1.0/jokes');
      expect(error.message).toBe(message);
      expect(error.timeStamp).toBeGreaterThan(nowInMS);
    });

    test('returns 200 when valid Hoax submitted with authorized user', async () => {
      await UserHelperModel.addMultipleNewUsers(1,0);
      const response = await postJoke(
        {
          content: 'Joke Content',
        },
        {
          auth: {email: emailUser1, password: passwordUser1},
        }
      );
      expect(response.status).toBe(200);
    });



    
  });
  ```
- Implementation
  The implementation for now is very simple, what we need is only to check whether the user exists or not. Previously we always check the token, whether the token is valid, and then store the user ID in the `req`
  ``` 
  public static async httpJokePost(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.authenticatedUser) {
        throw new ErrorAuthPost(Locales.unauthorizedJokeSubmit);
      }
      res.send();
    } catch(err) {
      next(err);
      return;
    }
  }
  ```




  ## 


  ## 



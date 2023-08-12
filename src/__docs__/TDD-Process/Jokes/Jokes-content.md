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

  In this route, we've checking the authentication first, before proceeding it. I think it's better if we protect this route with the authentication first and throw error get to the helper controller. 

  However it is better to put this checking into a middleware before the actual implementation. So the controller would be like this : 

  ```
  @routerConfig('/api/1.0/jokes')
  class JokesController {
    @post('/', JokeHelperController.httpJokePost)
    @use(checkAuthMWForJokeRoutes)
    jokesPost(): void{}
  }
  ```

  Then here's the middleware: 

  ```
  export async function checkAuthMWForJokeRoutes(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    if (!req.authenticatedUser) {
      ErrorHandle(new ErrorAuthPost(Locales.unauthorizedJokeSubmit), req, res, next);
      return;
    }

    next();
  }
  ```

  Now, in the implementation we can keep it clean like this : 

  ```
  export class JokeHelperController {
    public static async httpJokePost(
      req: RequestWithAuthenticatedUser,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        res.send();
      } catch(err) {
        next(err);
        return;
      }
    }
  }
  ```




## Saving Jokes to database

Now it's time to save the jokes to the database

Here are several tests:

```

  test('returns 200 when valid Hoax submitted with authorized user', async () => {
    await UserHelperModel.addMultipleNewUsers(1,0);
    const response = await postJoke(
      {content},
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );
    expect(response.status).toBe(200);
  });

  test('saves the joke to database, when authorized user sends valid request', async () => {
    await UserHelperModel.addMultipleNewUsers(1,0);
    await postJoke(
      {content},
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );
    
    const jokes = await Joke.findAll();
    expect(jokes.length).toBe(1);
  });

  test('saves joke content and timeStamp to database, when authorized user sends valid request', async () => {
    await UserHelperModel.addMultipleNewUsers(1,0);
    const beforeSubmit = Date.now();
    await postJoke(
      {content},
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );
    
    const jokes = await Joke.findAll();
    const savedJoke = jokes[0];
    expect(savedJoke.content).toBe(content);
    expect(savedJoke.timestamp).toBeGreaterThan(beforeSubmit);
    expect(savedJoke.timestamp).toBeLessThan(Date.now());
  });

  test.each`
  lang      | message
  ${'en'}   | ${en.jokeSubmitSuccess}
  ${'id'}   | ${id.jokeSubmitSuccess}
  `('returns $message to success submit when language $lang', async ({lang, message}) => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const response = await postJoke(
      {content}, 
      {
        language: lang,
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    expect(response.body.message).toBe(message);
  });
```

For the implementation, first of all we have to create the model for it first: 

```
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';

import { sequelize } from '../../config/database';

export class Joke extends Model<
  InferAttributes<Joke>,
  InferCreationAttributes<Joke>
> {
  declare id: CreationOptional<number>;
  declare content: string;
  declare timestamp: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Joke.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING,
    },
    timestamp: DataTypes.BIGINT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'joke',
  }
);
```

Next we create a helper function for this `Joke.helper.model` :

```
import { Joke } from './Joke.model';
import { 
  BodyRequestHttpPostJokeType,
  JokeObjectType 
} from './Joke.types';

export class JokeHelperModel {
  public static async createJoke(body: BodyRequestHttpPostJokeType) {
    const joke: JokeObjectType = {
      content: body.content,
      timestamp: Date.now(),
    }
    
    await Joke.create(joke);
  }
}
```

Also please the check the new type that we just added, and also the translation for success cases like this : 
```
  "jokeSubmitSuccess": "Joke is saved"
```

The final touch is this : 

```
  public static async httpJokePost(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await JokeHelperModel.createJoke(req.body);
      const response:SuccessResponse = {
        message: req.t(Locales.jokeSubmitSuccess),
      };

      res.send(response);
    } catch(err) {
      next(err);
      return;
    }
  }
}
```

We ensure that we send the success case with translation


## Validation

Let's ensure that the user sends the valid joke. Let's add our validation test:

```
  test.each`
  lang      | message
  ${'en'}   | ${en.validationFailure}
  ${'id'}   | ${id.validationFailure}
  `('returns 400 and $message when the content less than 10 char when language $lang', async ({lang, message}) => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const response = await postJoke(
      {content: invalidContent}, 
      {
        language: lang,
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });

  test('returns validation error body when an invalid joke post by auth user', async() => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const nowInMS = Date.now();

    const response = await postJoke(
      {content: invalidContent}, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    const error = response.body;

    expect(error.timeStamp).toBeGreaterThan(nowInMS);
    expect(error.path).toBe('/api/1.0/jokes');
    expect(Object.keys(error)).toEqual(['path', 'timeStamp', 'message', 'validationErrors']);
  });

  test.each`
    lang        | content                 | contentForDesc      |message
    ${'en'}     | ${null}                 | ${null}             |${en.errorJokeContentNull}
    ${'en'}     | ${'a'.repeat(9)}        | ${'short'}          |${en.jokeContentSize}
    ${'en'}     | ${'a'.repeat(5001)}     | ${'very long'}      |${en.jokeContentSize}
    ${'id'}     | ${null}                 | ${null}             |${id.errorJokeContentNull}
    ${'id'}     | ${'a'.repeat(9)}        | ${'short'}          |${id.jokeContentSize}
    ${'id'}     | ${'a'.repeat(5001)}     | ${'very long'}      |${id.jokeContentSize}
  `('returns $message when content is $contentForDesc and language is $lang', async ({lang, content, message}) => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const response = await postJoke(
      {content: content}, 
      {
        language: lang,
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    
    expect(response.body.validationErrors.content).toBe(message);
  });
```

As you can see here there are three tests to check for the validation. 
First off all let's add the translation and also the enum: 
```
"errorJokeContentEmpty": "\"content\" is not allowed to be empty",
"errorJokeContentNull": "\"content\" must be a text",
"jokeContentSize": "\"content\" must be at least 10 characters long and no longer than 5000 characters"
```

The code above is for English, but we also need to add for ID and also the `Locales.enum.ts`. 

Great, the next thing to do is to fix the validation schema: `jokePostSchema`, so it contains the same error message. 
 
```
import Joi from 'joi';
import { Locales } from '../Enum';

export const jokePostSchema = Joi.object({
  content: Joi.string()
    .required()
    .min(10)
    .max(5000)
    .messages({
      'any.required': Locales.errorJokeContentEmpty,
      'string.empty': Locales.errorJokeContentEmpty,
      'string.base': Locales.errorJokeContentNull,
      'string.min' : Locales.jokeContentSize,
      'string.max' : Locales.jokeContentSize,
    }),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});

```

Okay that's it. Then our validation error handlers will take care the rest. 

## Joke Migration

When we run our staging test, if failed. Due that we haven't created the migration table for the `joke`.

Let's create the migration file. Since we're using TS then let's create in manually, duplicate the previous migration file and rename it, now here's the migration: 
```
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('jokes', {
      id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: Sequelize.STRING,
      },
      timestamp: {
        type: Sequelize.BIGINT,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable('jokes');
  }
}
```



Remember:
In SQLite3, BIGINT values are stored as 64-bit integers, while in PostgreSQL, they are stored as text. This means that when you query a BIGINT column in SQLite3, you will get back a number, but when you query the same column in PostgreSQL, you will get back a string.

Therefore we have to create an adjustment a little bit in our test:


## Joke User Relationship

Now let's add user data to Joke table. 

We're going to add tests to to file, the `JokeSubmit.test.ts` and also `UserDelete.test.ts`. 

Now let's our first test: 

```
test('stores joke owner id in database', async () => {
  const user = await UserHelperModel.addMultipleNewUsers(1,0);

  await postJoke(
    {content}, 
    {
      auth: {email: emailUser1, password: passwordUser1},
    }
  );

  const jokes = await Joke.findAll();
  const joke = jokes[0];
  expect(joke.userID).toBe(user[0].id);
});
```

Now let's change the migration file and also the model file: 

Migration: 
```
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('jokes', {
      id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: Sequelize.STRING,
      },
      timestamp: {
        type: Sequelize.BIGINT,
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable('jokes');
  }
}
```

Here's we're adding a new column, however we have to delete our previous table. There's another way by creating a new migration file, and then we add this new column.
But I think this is okay, since it's quite simple. 

Then let's change the `Joke.model`:

```
export class Joke extends Model<
  InferAttributes<Joke>,
  InferCreationAttributes<Joke>
> {
  declare id: CreationOptional<number>;
  declare content: string;
  declare timestamp: CreationOptional<number>;
  declare userID: ForeignKey<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Joke.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING,
    },
    timestamp: DataTypes.BIGINT,
    userID: {
      type: DataTypes.INTEGER,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'joke',
  }
);

```

Great, it's not done yet, we have to modify the `User` model: 

```
User.hasMany(Joke, {
  onDelete: 'cascade',
  foreignKey: 'userID'
});
```

Okay, the last one is to create a test at User at `UserDelete.test`: 

```
test('deletes jokes from the database when delete user request sent from authorized user', async() => {
  const userList = await UserHelperModel.addMultipleNewUsers(1);
  const token = await auth({
    auth: { 
      email : emailUser1, 
      password: passwordUser1,
    }});

  await request(app)
    .post('/api/1.0/jokes')
    .set('Authorization', `Bearer ${token}`)
    .send({
    content: 'Jokes Content a lot!!!',
  });

  await deleteUser(
    userList[0].id, 
    {token}
  );
  
  const jokes = await Joke.findAll();

  expect(jokes.length).toBe(0);
});
```

Great now, we can check that it passes the test. 

## Listing Jokes

Now let's list all the jokes with pagination. Let's create a new test. It's quite similar with user listing. Now let's add our first test. After copy the test file, we need to comment most of it expect for the first test, and modify the function a little bit, so it'll look like this: 

- Test:
  ```
  describe('Listing All Jokes', () => {
  async function getJokes (page = 0 ) {
    const agent = request(app).get('/api/1.0/jokes').query({page});
    return await agent;
  }

  test('returns 200 ok when there are no jokes in database', async () => {
    const response = await getJokes();
    expect(response.status).toBe(200);
  });
  }
  ```
- Implementation: 
  Now let's set our route. 

In fact, the implementation is really similar with the UserListing, therefore, we only need to modify it a little bit. 

Here's the full test for `JokeListing.test`:

```
import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import request from 'supertest';
import { app } from '../app';
import { optionPostUser } from './UserRegister.test';

import { User, Auth, Joke, JokePaginationResponseTypes, UserHelperModel} from '../models';
import { sequelize } from '../config/database';
import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

const responseJokePaginationBlank: JokePaginationResponseTypes = {
  content: [],
  page: 0,
  size: 10,
  totalPages: 0,
};

async function getJokeWithSize (size = 10) {
  return await request(app).get('/api/1.0/jokes').query({size});
}

async function getUserByID(id = 5, option: optionPostUser = {}) {
  const agent = request(app).get(`/api/1.0/users/${id}`);
  if (option.language) {
    agent.set('Accept-Language', option.language);
  }

  return await agent;
}

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

describe('Listing All Jokes', () => {
  async function getJokes(page = 0 ) {
    const agent = request(app).get('/api/1.0/jokes').query({page});
    return await agent;
  }

  async function addJokes(count: number) {
    const user = await UserHelperModel.addMultipleNewUsers(count,0);
    for (let i=0; i < count; i++) {
      await Joke.create({
        content: `Content Of Great Jokes all ${i+1}`,
        timestamp: Date.now(),
        userID: user[i].id,
      });
    }
  }

  test('returns 200 ok when there are no jokes in database', async () => {
    const response = await getJokes();
    expect(response.status).toBe(200);
  });

  test('returns page object as response body', async () => {
    const response = await getJokes();
    expect(response.body).toEqual(responseJokePaginationBlank);
  });

  test('returns 10 jokes in page content when there are 11 jokes in the database', async () => {
    await addJokes(11);
    const response = await getJokes();
    expect(response.body.content.length).toBe(10);
  });

  test('returns id, content, timestamp, & user object (id, username, email, image) in the content', async () => {
    await addJokes(10);

    const response = await getJokes();
    const joke = response.body.content[0];
    const jokeKeys = Object.keys(joke);
    const userKeys = Object.keys(joke.user);
    
    expect(jokeKeys).toEqual(['id', 'content', 'timestamp', 'user']);
    expect(userKeys).toEqual(['id', 'username', 'email', 'image']);
  });

  test('returns 2 as totalPages when there are 11 Jokes', async () => {
    await addJokes(11);
    const response = await getJokes();
    expect(response.body.totalPages).toBe(2);
  });

  test('returns 2nd page jokes and page indicator when page is set as 1 in req params', async () => {
    await addJokes(11);
    const response = await getJokes(1);
    expect(response.body.content[0].content).toBe('Content Of Great Jokes all 1');
    expect(response.body.page).toBe(1);
  });

  test('returns first page when page is set below Zero as request parameter', async () => {
    await addJokes(11);
    const response = await getJokes(-5);
    expect(response.body.page).toBe(0);
  });

  test('returns first page when page is set with gibberish "asdf" as request parameter', async () => {
    await addJokes(11);
    const response = await request(app).get('/api/1.0/jokes').query({page: 'asdf'});
    expect(response.body.page).toBe(0);
  });

  test('returns 5 jokes and corresponding size indicator when size is set as 5 in req param', async () => {
    await addJokes(11);
    const response = await getJokeWithSize(5);
    expect(response.body.content.length).toBe(5);
    expect(response.body.size).toBe(5);
  });

  test('returns 10 jokes and corresponding size indicator when size is set as 1000 in req param', async () => {
    await addJokes(11);
    const response = await getJokeWithSize(1000);
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });

  test('returns 10 jokes and corresponding size indicator when size is set as 0 in req param', async () => {
    await addJokes(11);
    const response = await getJokeWithSize(0);
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });

  test('returns page as zero and size as 10 when non number query params provided', async () => {
    await addJokes(11);
    const response = await request(app).get('/api/1.0/jokes').query({page: 'asdf', size: 'asdf'});
    expect(response.body.size).toBe(10);
    expect(response.body.page).toBe(0);
  });

  test('returns jokes to be ordered from new to old', async() => {
    await addJokes(11);
    const response = await getJokes();
    const firstHoax = response.body.content[0];
    const lastHoax = response.body.content[9];
    expect(firstHoax.timestamp).toBeGreaterThan(lastHoax.timestamp);
  });

});
```

Great now the implementation:
- `Joke.controller.ts`:
  ```
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  import { post, get, use, routerConfig } from '../../decorators'; 
  import { JokeHelperController } from './joke.helper.controller';
  import { checkAuthMWForJokeRoutes,
    jokePostSchema,
    validationErrorGenerator,
    bodyValidatorMW,
    paginationMW
  } from '../../utils';

  const validationOption = {abortEarly: false};

  @routerConfig('/api/1.0/jokes')
  class JokesController {
    @post('/', JokeHelperController.httpJokePost)
    @use(bodyValidatorMW(jokePostSchema, validationErrorGenerator, validationOption))
    @use(checkAuthMWForJokeRoutes)
    jokesPost(): void{}

    @get('/', JokeHelperController.httpGetJokes)
    @use(paginationMW)
    jokesGet(): void{}
  }
  ```
  As you can see here I'm adding a middleware `paginationMW` to ensure that we will have pagination properties in the `req`
- `joke.helper.controller.ts`:
    ```
    public static async httpGetJokes(
      req: RequestWithPagination & RequestWithAuthenticatedUser,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        if (!req.pagination) {
          throw new Error('Pagination is not set properly');
        }

        const { page, size } = req.pagination;
        const jokes = await JokeHelperModel.getAllJokes(page, size);

        res.status(200).send(jokes);
        return;
      } catch (err) {
        next(err);
        return;
      }
    }
  }
  ```
  As you can see here, that we copy the previous implementation in the user listing. Nothing much changes.

- `Joke.helper.models.ts`
  ```
  public static async getAllJokes(
    page: number, 
    size: number, 
  ): Promise<JokePaginationResponseTypes>{

    const jokeList = await Joke.findAndCountAll({
      attributes: ['id', 'content', 'timestamp'],
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'image']
      },
      order: [['id', 'DESC']],
      limit: size,
      offset: page * size,
    });

    const totalPages = JokeHelperModel.getPageCount( jokeList.count, size);

    return JokeHelperModel.generateResUserPagination(jokeList.rows as unknown as JokeContentResponseTypes[], totalPages, page, size);
  }

  
  public static getPageCount(userCount: number, size: number): number {
    return Math.ceil(userCount / size);
  }

  public static generateResUserPagination(
    jokeList: JokeContentResponseTypes[], 
    totalPages: number, 
    page: number,
    size: number
  ): JokePaginationResponseTypes {
    return {
      content: jokeList,
      page,
      size,
      totalPages,
    };
  }
  ```
  As you can see here that we're changing it a little bit particularly for the data that we return back and also we add the order to sort the jokes from the newest to the latest. 

Remember in the user model, we have to create something like this: 

```
Joke.belongsTo(User, {
  foreignKey: 'userID'
});
```

## Listing Jokes of a User



## Running Test with Postgres

## Deployment

 



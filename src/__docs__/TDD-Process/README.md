# NodeJs with TDD

# Introduction

Application called : Joke Factory

## Tech Stack

- Restful API - Express.js
    
    
    | Restful API - Express.js |
    | --- |
    | validation |
    | i18n |
    | serving static resources |
    | caching |
    | json manipulation |
    | external services |
- ORM - Sequelize
    
    
    | ORM - Sequelize |
    | --- |
    | database version |
    | migration |
- TDD
    
    
    | TDD |
    | --- |
    | code quality |
    | reusability |
    | refactoring |
- Deployement
    
    
    | heroku |
    | --- |
    | google cloud |
- Github Actions

## Functionality

- Supported selected language
- Authentication :
    - Login
    - Sign Up
        - Email in use
        - Email Validation
    - Forget password
        - send email it it’s forgetting the password
        - set new password
- Menu :
    - List all of user
    - User Profile and change user name
    - Save image for user.
- User Post :
    - User can post information there.
    - We can see other user posts.
    - can delete the post
    - can see other posts.
- Delete account :
    - if the user delete the account, the user and their post is deleted.
- asdf

## Tools

- Postman
- SQLite database
    - DB Browser for SQlite
- Postgres
    - PG Admin
- VSCode extension :
    - ESLint ⇒ linting feedback
    - Prettier
- Git
- [putty.org](http://putty.org) for windows we need client like putty.

## Methodology

- Red
    - Write a test for the expected behavior
- Green
    - write the code for that test to pass
- Refactor
    - Cleanup your code: remove duplication, etc

# Set Up the project

First install all the initial dependencies : 

## Initial Dependency

- DevDpendencies :
    
    ```tsx
    "devDependencies": {
        "@types/express": "^4.17.17",
        "@types/jest": "^29.5.0",
        "@types/node": "^18.15.11",
        "@types/supertest": "^2.0.12",
        "reflect-metadata": "^0.1.13",
        "rimraf": "^5.0.0",
        "supertest": "^6.3.3",
        "ts-jest": "^29.1.0",
        "ts-node": "^10.9.1"
      },
    ```
    
- dependencies :
    
    ```tsx
    "dependencies": {
        "express": "^4.18.2"
      }
    ```
    

### install and set up jest &

- Next to set up the folder. The test folder is default in the `src` file and withing the folder `__tests__`
- After that setting up the `jest.config.ts` :
    - Please play attention to change the `testMatch` anytime you change the folder location.
    
    ```tsx
    import type {Config} from '@jest/types';
    
    const config: Config.InitialOptions = {
      preset: 'ts-jest',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.{ts,tsx}'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      }, 
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    };
    
    export default config;
    ```
    

## setup esLint & Prettier

- Then set up ES Lint
    - [Find and fix problems in your JavaScript code - ESLint - Pluggable JavaScript Linter](https://eslint.org/)
    - documentation : [Getting Started | typescript-eslint](https://typescript-eslint.io/getting-started)
    - install it  :
        - @typescript-eslint/parser
        - @typescript-eslint/eslint-plugin
        - eslint
        
        `npm install --save -dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint` 
        
    - create a file named : `.eslintrc.cjs`
        - Take a look at the rules. In the rules we’re checking our code to follow certain style. For example : `semi` means for semicolor. it shows warning if we forgot to put semi color. Then for quotes, we only use single quote
        - 
        
        ```tsx
        /* eslint-disable-next-line no-undef */
        module.exports = {
          extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
          parser: '@typescript-eslint/parser',
          parserOptions: {
            ecmaVersion: 2016,
            sourceType: 'module',
            project: './tsconfig.json',
          },
          plugins: ['@typescript-eslint'],
          root: true,
          rules: {
            semi: 'warn',
            quotes: ['warn', 'single'],
            indent: ['error', 2],
            //common use
            // 'no-console': 'warn',
            // 'no-debugger': 'error',
            // 'no-alert': 'error',
            // 'no-dupe-args': 'error',
            // 'no-empty': ['error', { allowEmptyCatch: true }],
            // 'no-eq-null': 'error',
            // 'no-invalid-this': 'error',
            // 'no-multi-spaces': 'error',
            // 'no-use-before-define': ['error', { functions: false, classes: false }],
            // 'no-var': 'error',
            // 'prefer-const': 'error',
            // 'prefer-template': 'error',
            // 'prefer-arrow-callback': 'error',
            // 'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
            // 'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
            // 'arrow-spacing': 'error',
            // 'prefer-destructuring': ['error', { object: true, array: false }],
            // 'object-shorthand': 'error',
            // 'array-bracket-spacing': ['error', 'never'],
            // 'no-unused-vars': 'off',
            // '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
          },
        };
        ```
        
    - We have to install ESLint in the VSCode extension to ensure it will shows error in our browser :
    - **`npx eslint <filename>` ⇒ this command will check our linting and shows in our terminal.**
    - to fix it `npx eslint src/index.ts --fix` it’ll fix the linting error.
    - or we can set a npm script `"lint": "eslint ."` this will check all of the file from the root
    - and to fix it we can run `npm run lint -- --fix`
- Prettier - integrate prettier with esLint
    - the package :
        - prettier
        - eslint-config-prettier
        - eslint-plugin-prettier
    - `npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier`
    - then add the configuration both in the `extends` , `plugins`, and in the `rules`. To avoid double error, we can remove the rules for esLint
    - here’s the configuration file :
        
        ```tsx
        /* eslint-disable-next-line no-undef */
        module.exports = {
          extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:prettier/recommended',
          ],
          parser: '@typescript-eslint/parser',
          parserOptions: {
            ecmaVersion: 2016,
            sourceType: 'module',
            project: './tsconfig.json',
          },
          plugins: ['@typescript-eslint', 'prettier'],
          root: true,
          rules: {
            eqeqeq: 'warn',
            'prettier/prettier': [
              'warn',
              {
                singleQuote: true,
                trailingComma: 'all',
                arrowParens: 'avoid',
                printWidth: 108,
                tabWidth: 2,
              },
            ],
          },
        };
        ```
        
    - Remember, that when we use prettier, it won’t allow us save file with the incorrect format. We can save the file without formating : `ctrl + shift + p` then choose save without formating.

# Client set up

There’s already a client there. However how to make the front end is explain in the course React with TDD. so we can revisit it later. 

To run the client : 

`npx http-server -c-1 -p 8080 -P [http://localhost:3000](http://localhost:3000/)` 

# First End Point : Sign Up

- In Jest, **`test()`** and **`it()`**
 are two equivalent functions that are used to define a test case or a group of related test cases. They have no functional difference; they can be used interchangeably to achieve the same result.
    - Here’s the test for the end point . this uses `request` from `supertest` . to create an app request.
    
    ```tsx
    import request from 'supertest';
    import { app } from '../app';
    
    describe('User Registration', () => {
      test('Return 200, when the sign up request is valid', async () => {
        const response = await request(app).post('/v1/users').send({
          userName: 'user1',
          email: 'user1@gmail.com',
          password: 'P4ssword',
        });
        expect(response.status).toBe(200);
      });
    
      test('Return success message when sign up is successful', async () => {
        const response = await request(app).post('/v1/users').send({
          userName: 'user1',
          email: 'user1@gmail.com',
          password: 'P4ssword',
        });
    
        const responseBody = await response.body;
    
        expect(responseBody).toStrictEqual({
          message: 'User is created',
        });
      });
    });
    ```
    
    - In the mean time. I just set it to pass with the test. to ensure I can check the app it works.
    

# Saving user to Database

Dependency:

- sequalize
- sqlite3

- Using sequalize : [Sequelize | Feature-rich ORM for modern TypeScript & JavaScript](https://sequelize.org/)
    - **`Sequelize`**
     is an Object-Relational Mapping (ORM) library for Node.js, which provides an easy-to-use interface for interacting with relational databases such as MySQL, PostgreSQL, SQLite, and MSSQL.
    - Using Sequelize, you can define your database schema and models in JavaScript code, and then easily perform database operations such as creating, querying, updating, and deleting records using a simple and intuitive API.
    - Sequelize is widely used in the Node.js ecosystem and is known for its robustness, flexibility, and ease of use. It's a popular choice for building web applications and APIs that require database connectivity.
- Sqlite3 : [SQLite Home Page](https://www.sqlite.org/index.html)

- We’re going to install both Sequalize and sqlite3
    - `npm install sequelize sqlite3`

Then we create two folder named `config` then `model` : 

- In the `config` folder we create a database configuration file called `database.ts` :
    - the code creates a database using the SQLite dialect and stores it in the **`./database.sqlite`**
     file.
    - **If a file with that name already exists in the file system,** the code will use it as the database file and will not create a new one. Instead, it will connect to the existing database file and use it to perform CRUD operations. If the file does not exist, the code will create a new database file with that name.
    - It's worth noting that if the existing database file contains tables or data that conflict with the schema and data models defined by the code, the application may encounter errors or data inconsistencies when trying to interact with the database. In such cases, it may be necessary to modify the code to align with the existing database schema, or to use a different database file or name. || OR JUST DELETE THE OLD DATABASE IF THE SCHEMA IS DIFFERENT!
    
    ```tsx
    import dotenv from 'dotenv';
    dotenv.config();
    
    import { Sequelize, Dialect } from 'sequelize';
    
    const DBUSER = process.env.DBUSER;
    const DBPASS = process.env.DBPASS;
    const DBNAME = process.env.DBNAME;
    
    const dialect: Dialect = 'sqlite';
    
    const optParameter = {
      dialect: dialect,
      storage: './database.sqlite',
      logging: false,
    };
    
    if (!DBUSER || !DBPASS || !DBNAME) {
      throw new Error('Please set up credential for database');
    }
    
    export const sequelize = new Sequelize(DBNAME, DBUSER, DBPASS, optParameter);
    ```
    
- Next in the folder `model` we create a file named `User.ts`
    - Define a **`User`** class that extends the **`Model`** class provided by Sequelize. The **`InferAttributes`** and **`InferCreationAttributes`** utility types are used to infer the attribute types and creation attributes of the model from its properties.
    - Declare the **`username`**, **`email`**, and **`password`** attributes on the **`User`** class using TypeScript's **`declare`** keyword. This tells the TypeScript compiler that these properties will be defined at runtime by Sequelize, and prevents type checking errors.
    - Call the **`init`** method on the **`User`** class to define the model's schema and options. The first argument to **`init`** is an object that defines the attributes of the **`User`** model and their data types. The **`DataTypes`** object provides the data types that Sequelize supports.
    - The second argument to **`init`** is an options object that specifies the **`sequelize`** instance (in the config file)  to use and the name of the model (**`user`**) or the table name.
    - If the table 'user' doesn't exist yet, running this code will create a new 'user' table with the specified columns. If the 'user' table already exists, running this code again will not throw an error, but it will not modify the existing table either. The existing table will remain the same, and any new data will be added as new rows.
    - Note that if you change the columns in the User.init() function and re-run the code, Sequelize will try to modify the table to match the new column definitions. In some cases, this may cause data loss or other issues, so you should always be careful when modifying an existing table.
    
    ```tsx
    // prettier-ignore
    import {
      Model,
      InferAttributes,
      InferCreationAttributes,
      CreationOptional,
      DataTypes,
    } from 'sequelize';
    
    import { sequelize } from '../../config/database';
    
    export class User extends Model<
      InferAttributes<User>,
      InferCreationAttributes<User>
    > {
      declare username: string;
      declare email: string;
      declare password: string;
    }
    
    User.init(
      {
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
      },
      {
        sequelize,
        modelName: 'user',
      }
    );
    ```
    
- in the same folder `model` I also create a helper file to help create a helper function for the model. However I have to change the name and the structure a little bit.
    
    ```tsx
    import { User } from './User';
    
    export interface NewUser {
      username: string;
      email: string;
      password: string;
    }
    
    export async function createUser(newUser: NewUser) {
      const user = await User.create(newUser);
      return user;
    }
    ```
    

Then we can create a test for it. Here’s the test to check whether the user information is saved in the database:  

- `sequelize.sync()` :
    - the code **`sequelize.sync()`** synchronizes all defined models with the database. It creates the necessary tables if they do not already exist, and updates the schema of existing tables to match the model definitions.
    - Note that **`sequelize.sync()`** can be a destructive operation, as it can modify the structure of existing tables and cause data loss. Therefore, it should be used with caution in production environments. In development, it can be useful for quickly setting up a new database or resetting an existing one.
    - You can also pass options to **`sequelize.sync()`** to control its behavior, such as **`force: true`** to drop and recreate all tables.
- `User.destory( {truncate: true} )`
    - The code **`User.destroy({ truncate: true })`** deletes all rows from the **`User`** table and resets the auto-incrementing ID counter to 1.
    - The **`{ truncate: true }`** option is used to truncate the table, which means that it deletes all rows from the table, but leaves the table structure intact. This is different from dropping the table, which would also delete the table structure and require recreating the table from scratch.
    - Note that **`User.destroy({ truncate: true })`** can be a dangerous operation, as it can cause data loss if you do not intend to delete all rows from the table. It should be used with caution, and you should ensure that you have a backup of your data before running this command.

```tsx
import request from 'supertest';
import { app } from '../app';
import { User } from '../models';
import { sequelize } from '../config/database';

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe('User Registration', () => {
  test('Return 200, when the sign up request is valid', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      userName: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });
    expect(response.status).toBe(200);
  });

  test('Return success message when sign up is successful', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    const responseBody = await response.body;

    expect(responseBody).toStrictEqual({
      message: 'User is created',
    });
  });

  test('Save user to the database', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    //query user table
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  test('Saves the username and email to database', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });

    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@gmail.com');
  });
});
```

Implementation: 

Here’s the implementation to ensure we pass the test : 

`user.controller.ts` ⇒ I refactor it, so in the controller file it only contains the function name. 

```tsx
import { Request, Response } from 'express';
import { routerConfig, post } from '../../decorators';
import { httpPostSignUp } from './user.helper.controller';

@routerConfig('/api/1.0')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserController {
  @post('/users')
  async httpPostSignUpController(req: Request, res: Response): Promise<void> {
    await httpPostSignUp(req, res);
  }
}
```

`user.helper.controller.ts` ⇒ Now here’s the helper file that contains all the implementation. 

```tsx
import { Request, Response } from 'express';
import { createUser, NewUser } from '../../models';

export async function httpPostSignUp(
  req: Request,
  res: Response
): Promise<void> {
  const newUserData: NewUser = req.body;
  //TODO : Body Validation
  const newUser = await createUser(newUserData);

  res.status(200).send({
    message: 'User is created',
  });
  return;
}
```

## Hashing password in the database

This is like before when we tried to hash password to the database. 

However I have to adjust the model class to be like this : 

```tsx
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from 'sequelize';

import { sequelize } from '../../config/database';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'user',
  }
);

// (sequelize) Warning: SQLite does not support 'INTEGER' with UNSIGNED or ZEROFILL. Plain 'INTEGER' will be used instead.
```

Based on the documentation the ID is the optional one. and there’s a not about sqlite `INTERGER.UNSIGNED` is not support by sqlite, therefore I remove it . 

# Quick refactoring

## Validation

- I decided to wrap all the functions withing `user.helper.controllers` and also `user.helper.model` in a static class. So I can call them easily.
- Validation error. Using Joy we can use the error message for the specific field and return it to the front end : Read more [joi.dev - 17.9.1 API Reference](https://joi.dev/api/?v=17.9.1#errors)
- **`ValidationError`**

**joi** throws or returns `ValidationError` objects containing :

- `name` - `'ValidationError'`.
- `isJoi` - `true`.
- `details` - an array of errors :
    - `message` - string with a description of the error.
    - `path` - ordered array where each element is the accessor to the value where the error happened.
    - `type` - type of the error.
    - `context` - object providing context of the error containing:
        - `key` - key of the value that erred, equivalent to the last element of `details.path`.
        - `label` - label of the value that erred, or the `key` if any, or the default `messages.root`.
        - `value` - the value that failed validation.
        - other error specific properties as described for each error code.
- `annotate()` - function that returns a string with an annotated version of the object pointing at the places where errors occurred. Takes an optional parameter that, if truthy, will strip the colors out of the output.

## Putting the validation in the middleware

# Environment

Basically there are four environments : 

- Development
- Testing
- Staging
- Production

We must have a separate database for tests so that we can make sure our tests are running in a predictable way. 

- `config` ⇒ regular dependencies , like `dotenv` ?  So it’s better for us just using `dotenv`
    - [config - npm (npmjs.com)](https://www.npmjs.com/package/config)
- `cross-env` ⇒ development dependencies.  (For windows only? ) - we don’t have to install this.
    - [cross-env - npm (npmjs.com)](https://www.npmjs.com/package/cross-env)

so, here’s how add development environment before we run the node or run a test :  `"NODE_ENV=development node dist/index.js",` 

```tsx
"scripts": {
    "clean": "rimraf dist",
    "start:server": "NODE_ENV=development node dist/index.js",
    "watch": "NODE_ENV=development nodemon dist/index.js",
    "compile:watch": "tsc --watch -p tsconfig.build.json",
    "compile": "tsc -p tsconfig.build.json",
    "prestart": "npm run clean && npm run compile ",
    "start": "npm run compile:watch & npm run watch",
    "deploy": "npm run clean && npm compile && npm start:server",
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watchAll",
    "test:coverage": "NODE_ENV=test jest --coverage",
    "lint": "eslint ."
  },
```

How? 

- Create three **`.env`** files: **`.env.test`**, **`.env.development`**, and **`.env.production`**. Set the environment-specific values in each file.
- declare like this `require('dotenv').config({ path: .env.${process.env.NODE_ENV} });` on top of the file, for example the database file .
    - This will load the **`.env.test`** file if **`NODE_ENV`** is set to **`test`** , **`.env.development`** file if **`NODE_ENV`** is set to **`development`** , and **`.env.production`**file if **`NODE_ENV`**is set to **`production`**
- Access the environment-specific values in your code using **`process.env.VARIABLE_NAME`**, where **`VARIABLE_NAME`** is the name of the variable set in the **`.env`** file.
- don’t forget before we run the test or run the server we add the environment variable in this case `NODE_ENV=xxx`

For SQLITE, we can use a special keyword `:memory:`

So it wont’ create a database, instead the database would be in the memory. 
Either is okay though, and no error from my end. 

# Dynamic Test with Jest

Here’s the documentation: 
[Globals · Jest (jestjs.io)](https://jestjs.io/docs/api#testeachtablename-fn-timeout) 

This example is really great. Particularly when we’re expecting doing a lot of repetition :

```
test.each([
    ['username','"username" is not allowed to be empty'],
    ['email','"email" is not allowed to be empty'],
    ['password','"password" is not allowed to be empty'],
  ])('When %s is empty, %s is received', async (field:string, expectedMessage: string) => {
    const userModified: NewUser = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = '';
    const response = await postUser(userModified);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpStatusOnlyFailed);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors[field]).toBe(expectedMessage);
  });

  test.each([
    ['username','"username" must be a string'],
    ['email','"email" must be a string'],
    ['password','"password" must be a string'],
  ])('When %s is null, %s is received', async (field:string, expectedMessage: string) => {
    const userModified: UserModified= {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = null;
    const response = await postUser(userModified);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpStatusOnlyFailed);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors[field]).toBe(expectedMessage);
  });
```

Or just like this : 

```tsx
test.each([
    ['email'],
    ['email@'],
    ['@yahoo'],
    ['email@yahoo'],
    ['email@yahoo..com'],
    ['email@@yahoo..com'],
    ['email@gmailcom'],
    ['emailgmailcom'],
  ])('This email: "%s" is invalid', async (email:string) => {
    const userModified: UserModified = {
      username: 'user1',
      email: email,
      password: 'PpaSwo#rD9d',
    };

    const response = await postUser(userModified);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpFailedInvalidEmail);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors.email).toBe(signUpFailedInvalidEmail.message);
  });
```

anyway this is even cooler ⇒ we can use string literal and display it in a table like this : 

```tsx
test.each`
  a    | b    | expected
  ${1} | ${1} | ${2}
  ${1} | ${2} | ${3}
  ${2} | ${1} | ${3}
`('returns $expected when $a is added to $b', ({a, b, expected}) => {
  expect(a + b).toBe(expected);
});
```

Example : for more than one property I believe this format is far away better. 

```tsx
test.each`
    field           | errorMessage
    ${'username'}   | ${'"username" is not allowed to be empty'}
    ${'email'}      | ${'"email" is not allowed to be empty'}
    ${'password'}   | ${'"password" is not allowed to be empty'}
  `('When $field is empty, %errorMessage is received', async ({field, errorMessage}) => {
    const userModified: NewUser = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'A4GuaN@SmZ',
    };
    userModified[field] = '';
    const response = await postUser(userModified);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(signUpStatusOnlyFailed);
    expect(response.body.message).not.toBeUndefined;
    expect(response.body.validationErrors[field]).toBe(errorMessage);
  });
```

## joi validation :

By default, when you validate an object with Joi and there are multiple validation errors, Joi will return an error for the first validation that fails. However, you can change this behavior by setting the **`abortEarly`** option to **`false`**.

When **`abortEarly`** is **`false`**, Joi will validate all fields in the object and return an array of errors for each validation that fails. Here's an example of how you can use the **`abortEarly`** option:

```tsx
const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().required(),
});

const data = {
  name: '',
  age: 'abc',
};

const options = {
  abortEarly: false,
};

const { error } = schema.validate(data, options);

if (error) {
  console.log(error.details);
}
```

# Internationalization

This is how we send a response based on the language that is requested by the client.

So we use this : `i18next` 

There are three packages : 

- [i18next - npm (npmjs.com)](https://www.npmjs.com/package/i18next)
- [i18next-fs-backend - npm (npmjs.com)](https://www.npmjs.com/package/i18next-fs-backend)
- [i18next-http-middleware - npm (npmjs.com)](https://www.npmjs.com/package/i18next-http-middleware)

```tsx
"i18next": "^22.4.14",
    "i18next-fs-backend": "^2.1.1",
    "i18next-http-middleware": "^3.3.0",
```

then import in ini our `app.ts` 

```tsx
import i18next from 'i18next';
import Backend  from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
```

and then we set up in the beginning of the app like this : 

```tsx
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
```

then we create a folder in the root called `locales` , and for each language we create a folder : 

- `en` for english
- `id` for Indonesian

Then we create a json file name `translation.json` : 

```json
{
  "errorPassword1": "Kata sandi harus mengandung 1 huruf besar, 1 huruf kecil, 1 simbol, & 1 angka",
  "errorPassword2": "panjang \"kata sandi\" minimal harus 8 karakter",
  "errorUsernameEmpty": "\"nama pengguna\" tidak boleh kosong",
  "errorEmailEmpty": "\"email\" tidak boleh kosong",
  "errorPasswordEmpty": "\"kata sandi\" tidak boleh kosong",
  "errorUsernameNull": "\"nama pengguna\" harus berupa string",
  "errorEmailNull": "\"nama pengguna\" harus berupa string",
  "errorPasswordNull": "\"kata sandi\" harus berupa string",
  "errorEmailInvalid": "\"email\" harus berupa email yang valid",
  "errorUserExist": "sudah terdaftar",
  "userCreated": "Akun pengguna telah dibuat"
}
```

the middleware should be put before we declare our router. 

then viola. 

> When the client sends a response with header `Accept-Language` and has a value either `id` or `en` then we can translate it. How?
> 

Since we get this in the middleware then we can call it using `req.t()` . for example : 

```json
req.t('userCreated')
```

# User Activation

After the user registered, we will send link to their email, and they should click the link to activate the email. 

## Test & Create `inactive` field

- Let’s create a test which test the `inactive` properties in the database field
    
    ```json
    test('creates user in inactive mode', async () => {
        await postUser();
        const userList = await User.findAll();
        const savedUser = userList[0];
        expect(savedUser.inactive).toBe(true);
      });
    ```
    
    This shows error from TypeScript automatically, since the User model doesn’t have the field. What a great one TypeScript! 
    
- Then let’s add the the properties User model : `inactive` and set it to be `true` for the default value:
    - REMEMBER: since we don’t put `inactive` in the field when we post the new user. we have to make it `CreationOptional`. If not, TypeScript will detect an error here.
    
    ```json
    export class User extends Model<
      InferAttributes<User>,
      InferCreationAttributes<User>
    > {
      declare id: CreationOptional<number>;
      declare username: string;
      declare email: string;
      declare password: string;
      declare inactive: CreationOptional<boolean>;
      declare createdAt: CreationOptional<Date>;
      declare updatedAt: CreationOptional<Date>;
    }
    
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
        },
        inactive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        password: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'user',
      }
    );
    ```
    
- Then voila … the test is passed now.

## Test & Create `activationToken` field

- Here’s the test : when saving user to the database a field `activationToken` should be filled with random string.  In this case, we’re using `.toBeTruthy` to ensure there’s a value within the database field. Use `.toBeTruthy`when you don't care what a value is and you want to ensure a value is true in a boolean context. In JavaScript, there are six falsy values:
    - `false`
    - `0`
    - `''`
    - `null`
    - `undefined`
    - and `NaN`
    . Everything else is truthy.
    
    ```tsx
    test('creates an activationToken for user', async () => {
        const response = await postUser();
        const userList = await User.findAll();
        const savedUser = userList[0];
        expect(response.status).toBe(200);
        expect(savedUser.activationToken).toBeTruthy();
      });
    ```
    
- The now we fix the  the User class model. Remember to add `CreationalOptional` since we don’t take this in the request body form. We’ll add this later in the `helper.model` function.
    
    ```tsx
    export class User extends Model<
      InferAttributes<User>,
      InferCreationAttributes<User>
    > {
      declare id: CreationOptional<number>;
      declare username: string;
      declare email: string;
      declare password: string;
      declare inactive: CreationOptional<boolean>;
      declare activationToken: CreationOptional<string>;
      declare createdAt: CreationOptional<Date>;
      declare updatedAt: CreationOptional<Date>;
    }
    
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
        },
        password: DataTypes.STRING,
        inactive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        activationToken: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'user',
      }
    );
    ```
    
- Then we modify our the `helper.model` function
    - We create a new function  to  generate a token : `generateToken`
    - also a function to generate user object with Token :
    
    ```tsx
    export class UserHelperModel {
      public static async createUser(newUser: NewUser): Promise<UserDataFromDB> {
        const userWithHash = await UserHelperModel.createUserWithHash(newUser);
    
        const userWithHashAndToken = UserHelperModel.createUserWithHashAndToken(userWithHash);
    
        const user: User = await User.create(userWithHashAndToken);
    
        const { id, username, email } = user;
    
        return { id, username, email };
      }
    
      private static async createUserWithHash(
        newUserData: NewUser
      ): Promise<NewUser> {
        const hash = await UserHelperModel.hashPassword(newUserData.password);
    
        const userWithHash: NewUser = { ...newUserData, password: hash };
    
        return userWithHash;
      }
    
      private static createUserWithHashAndToken(userWithhash: NewUser): NewUser{
        return { ...userWithhash, activationToken: UserHelperModel.generateToken(16) };
      }
    
      private static async hashPassword(plainTextPass: string): Promise<string> {
        const saltRounds = 10;
        const hash = await bcrypt.hash(plainTextPass, saltRounds);
        return hash;
      }
    
      public static async userExistsByEmail(email: string): Promise<boolean> {
        const user = await User.findOne({ where: { email: email } });
        return !!user; 
      }
    
      public static async userExistsByUserName(username: string): Promise<boolean> {
        const user = await User.findOne({ where: { username: username } });
        return !!user; 
      }
    
      private static generateToken(length: number) {
        return crypto.randomBytes(length).toString('hex').substring(0, length);
      }
    }
    ```
    
- Then viola … Everything is set.

# Activation Email

Our tests must be running in a reliable environment. Email is an external service, and when it comes to external services, our test may be failing with network errors or any unexpected external environment related behaviours. 

> So our tests would be failing even there’s nothing wrong with our implementation in test
> 

> In test, we should be making sure our application is doin what it’s supposed to do.
> 

We’re going to use : 

- `nodemailer`
    - npm page : [nodemailer - npm (npmjs.com)](https://www.npmjs.com/package/nodemailer)
        - Definition Type : [@types/nodemailer - npm (npmjs.com)](https://www.npmjs.com/package/@types/nodemailer)
    - official site : [Nodemailer :: Nodemailer](https://nodemailer.com/about/)
- Install it :
    - `npm install nodemailer`
    - `npm install @types/nodemailer --save-dev`
    - 

> We have to mock the behaviour of this nodemailer, to ensure our test is realiable. In the future if we want to replace `nodemailer` package with other package then we have to update our tests accordingny.
> 

to mock it : the recommended libraries is `nodemailer-stub` : [nodemailer-stub - npm (npmjs.com)](https://www.npmjs.com/package/nodemailer-stub?activeTab=readme) however it seems only few people using this. and it doesn’t support TS at all. 

I found the allternative called : `ts-mockito` . it supports ts out of the box :  [ts-mockito - npm (npmjs.com)](https://www.npmjs.com/package/ts-mockito) . And it’s quite populer. 

I decides to use `ts-mockito` though. 

Okay I gave up. In the mean time, I just use `nodemailer-stub` . I don’t understand at all, and chatGPT gave a very bad recommendation. 

So: here’s the test : 

```tsx
import nodemailerStub from 'nodemailer-stub';

test('sends an Account activation email with activationToken', async () => {
    await postUser();
    const lastMail = nodemailerStub.interactsWithMail.lastMail();
    expect(lastMail.to[0]).toBe('user1@gmail.com');
    const users = await User.findAll();
    const savedUser = users[0];
    expect(lastMail.content).toContain(savedUser.activationToken);
  });
```

However since this library doesn’t have any definition type we have to create one . 

in the `src` folder create a new folder called `types` . then create a file named `nodemailer-stub.d.ts`  and declare this : 

```tsx
declare module 'nodemailer-stub';
```

Now let’s go to the implementation. 

we will send the email after the creation of the user.  

Let’s create a function called in a filder `email` within `src` folder and a file named `EmailService.ts` 

```
import { transporter } from '../config/emailTransporter';
import { User } from '../models';

export async function sendAccountActivation(user: User) {

  await transporter.sendMail({
    from: 'Joke Factory <hello@jokefactory>',
    to: user.email,
    subject: 'Account Activation',
    html: `Token is ${user.activationToken}`,
  });
}
```

Then in the folder `config` we create a new file to define the `transporter` :  the file name is `emailTransporter.ts` 

```tsx
import nodemailer from 'nodemailer';
import nodemailerStub from 'nodemailer-stub';

export const transporter = nodemailer.createTransport(nodemailerStub.stubTransport);
```

in the `User.helper.model`  Then let’s call it in the `createuser` function  : 

```
public static async createUser(newUser: NewUser): Promise<UserDataFromDB> {
    const userWithHash = await UserHelperModel.createUserWithHash(newUser);

    const userWithHashAndToken = UserHelperModel.createUserWithHashAndToken(userWithHash);

    const user: User = await User.create(userWithHashAndToken);

    await sendAccountActivation(user);

    const { id, username, email } = user;

    return { id, username, email };
  }
```

Ok , to be honest I still don’t know how this nodemailer and this nodemailer-stub works. But it works in this project, for the test part. I have to learn about this. 

Quick update about my understanding: 

- Nodemailer will send and email through a setting that we provide.
- nodemailer-stub is like a working email that we send to, and it containst all the email that we send.

In order to send real email, we have to use email service like google. But I’ll learn about it later. 

My idea is using both : 

- Gmail
- Zoho

To send verification request to the user. 

Ok, now let’s learn it later. 

# Handle Email Failed Cases

How we send something to the user, for example something fails with the email. 

When email is rejected from the actual email server. 

> Noted: We have to create the user first before we send the the activation email. However if the email activation failed, we have to remove the user, right? Since we can’t validate the user. Therefore we have to use `transaction` in `sequalize`
> 

so it’s like this :

```tsx
const transaction = await sequelize.transaction();

    const user: User = await User.create(userWithHashAndToken, {transaction});

    try {
      await EmailService.sendAccountActivation(user);
    } catch (err) {
      await transaction.rollback();
      throw new SendAccountActivationFailed('emailFailure');
    }

    await transaction.commit();
    const { id, username, email } = user;
    return { id, username, email };
```

# Refactor the validation test

We added the test for email with mocking. Mocking means interacting with the implementation. 

To have more maintainable tests, it’s always a good practice to make it as generic as possible. 

We’re going to use package 

- ****smtp-server :**** [smtp-server - npm (npmjs.com)](https://www.npmjs.com/package/smtp-server)
- Types definition : [@types/smtp-server - npm (npmjs.com)](https://www.npmjs.com/package/@types/smtp-server)

> Tips: we can add `f` before the individual test, so we can focus more on that test:
`fit` .  or `test.only` . So within that file we only run that test, and others are skipped.  
Or we can also use `.skip` to skip a block of test or a certain test only.
> 

> Or, we we only want to run a certain test. 
we can copy the test description for example : `test('sends an Account activation email with activationToken'` 
And we run in the console :  `npm run test:watch`  then hit `w` hen hit `t` then run the test name : 
`sends an Account activation email with activationToken`
> 

or we can install a package named : `jest-watch-typeahead` 

: [jest-watch-typeahead - npm (npmjs.com)](https://www.npmjs.com/package/jest-watch-typeahead) 

then we set up the configuration in the `jest.config.ts` : 

```tsx
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  // automock: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{ts,tsx}'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};

export default config;
```

Then we run the test watch again, and we can filter it by a test name regex pattern or file name and it will run it. 

Ok now we’re going to replace the `nodemailerStub` with the `SMTP server` package from nodemailer. 

here’s how : 

```tsx
import { SMTPServer } from 'smtp-server'; 

test('sends an Account activation email with activationToken', async () => {
    let lastMail;
    const server = new SMTPServer({
      authOptional: true,
      onData(stream, session, callback) {
        let mailBody = '';
        stream.on('data', (data) => {
          mailBody += data.toString();
        });
        stream.on('end', () => {
          lastMail = mailBody;
          callback();
        });
      },
    });

```

Then in the `emailTransporter.ts` when we configure how we set up nodemailer, we change it to the smtp server that we create: 

```tsx
import nodemailer from 'nodemailer';
// import nodemailerStub from 'nodemailer-stub';

export const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 8585,
  tls: {
    rejectUnauthorized: false,
  },
});
```

Now let’s move the setting in the beginning. 

```tsx
beforeAll( () => {
  server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody = '';
      stream.on('data', (data) => {
        mailBody += data.toString();
      });
      stream.on('end', () => {
        if (simulateSmtpFailure) {
          const err = new ErrorSimulate('Invalid mailbox');
          err.responseCode = 533;
          return callback(err);
        }
        lastMail = mailBody;
        callback();
      });
    },
  });

  server.listen(8585, 'localhost');

  return sequelize.sync({force:true});
});

beforeEach(() => {
  simulateSmtpFailure = false;
  jest.restoreAllMocks();
  return User.destroy({ truncate: true });
});

afterAll(() => {
  server.close();
});
```

Now, we no longer need `nodemailer-stub` . 

# Activating Account

Challenge: 

- Create a the email validation ⇒ The user will send back the token to the server. Create an API for it. Create a test for it.  (done)
    - test: the inactive : false
    - `/api/1.0/users/token/982738478374`
- Delete the token from the database if it is successful . (done)
- Doesn’t activate the user if the token is wrong.   (done)
- Success & Failure status in multiple languages:  (done)
    - Success : “ Account is activated”
    - Failed : “This account is either active or the token is invalid”

Done: The test and implementation are in the source code. 

# Testing on the client side

If we use our client in development mode. 
How do we ensure that we can have the link to validate it? 

In the development environment we can use fake SMTP server called Ethereal. 

Challange: 15 minutes to get it done. 

- First update the `.env.test` and `.env.development` to ensure we have the set up for `emailTransporter` : We stored it using the JSON format
    - `.env.test` : `transporter_config={"host": "localhost","port": 8585,"tls": {"rejectUnauthorized": false}}`
    - `.env.development` : `transporter_config={"host": "smtp.ethereal.email","port": 587,"auth": {"user": "herminia.beatty@ethereal.email","pass": "PuJeErtgZjcxHmuhr3"}}`
- Second, update the settig in the `emailTransporter` to take the setting from the development environment :
    
    ```tsx
    import dotenv from 'dotenv';
    dotenv.config({path: `.env.${process.env.NODE_ENV}`});
    import nodemailer from 'nodemailer';
    
    const configSTring = process.env.transporter_config;
    if (!configSTring) {
      throw new Error(
        'Please set up configuration for Email transport'
      );
    }
    
    const config = JSON.parse(configSTring);
    
    export const transporter = nodemailer.createTransport(config);
    ```
    
- The last one in the `emailService.ts` , we update the html so it could contain the link for the activation token. The activation link is from the front end, so nothing to do in our end.  Then we check wehther it’s a development environment or test. If it’ development environment, then we log the activation link :

  

```tsx
import { transporter } from '../config/emailTransporter';
import { User } from '../models';
import nodemailer from 'nodemailer';

export async function sendAccountActivation(user: User): Promise<void | Error> {
  const response = await transporter.sendMail({
    from: 'Joke Factory <hello@jokefactory>',
    to: user.email,
    subject: 'Account Activation',
    html: `
    <div>
      Please click link below to active the account
    <div>
    <div>
      <a href="http://localhost:8080/#/login?token=${user.activationToken}">Activate Account</a>
    <div>
      `,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(nodemailer.getTestMessageUrl(response));
  }

}
```

Viola. It’s done. 

# Error Handling - Refactoring

- First we put errorHandler function in the middleware, right after the router.
    - There are three error handlers in my project now  :
        - JSON Syntax  (Just keep it separated, since I’m afraid it makes the code slow down) .
        - JOI Validation
        - Controller - Model
    - Move all of them to a central error handler
- Refactor the error handle, so there’s no duplication, particulary when send a response. (done)
- Error body :
    - Other than validation error :
        - `message` , `path`,  `timeStamp` asdf asdf
        - path is the API
    - For validation error, there’s an additional one :  `validationError`
- path is the original url , we use this function `req.originalurl`
- for timestamp, is checking whether we have the time when the error is send. Check the source code.
- 

# Loading User

> REMEMBER: JEST runs several tests simultaneously by default. This could lead to inconsistency result, sometimes it passes and sometimes it fails. Therefore we have to run all the test serially, not simultaneously.  Read this in the documentation : [Jest CLI Options · Jest (jestjs.io)](https://jestjs.io/docs/cli#--runinband) . So we add `--runInBand`  in the command line to ensure it runs one by one .
> 

## User Page Response

Let’s list registered user on home page. 

- Test. Now let’s create a new test called `UserListing.test.ts`
    
    of course it returns error. since there’s no router to handle it. 
    
    ```tsx
    describe('Listing users', () => {
      test('returns 200 ok when there are no user in database', async () => {
        const response = await request(app).get('/api/1.0.users');
        expect(response.status).toBe(200);
      });
    });
    ```
    
- Now let’s create a router for it .
    
    in the main controller. We’re adding the routes for it. 
    
    ```tsx
    class UserController {
      @post('/', UserHelperController.httpPostSignUp)
      @use(bodyValidatorMW(signUpSchema, signUpValidationErrorGenerator, validationOption))
      usersPost(): void {}
      
      @post('/token/:token', UserHelperController.httpActivateAccount )
      usersTokenParams():void{}
    
      @get('/', UserHelperController.httpGetUsers)
      usersGet(): void {}
    }
    ```
    
    Now in the helper we add something to pass the test 
    
    ```tsx
    public static async httpGetUsers(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void>{
        try {
          res.status(200).send('');
        } catch (err) {
          next(err);
          return;
        }
      }
    ```
    
- Pagination
    - It’s impossible for us to send all of the users. Let’s say we have millions of user. Then it’s going to be impossible right? So we use pagination.
    - Let’s try to create a blank test first and do the implementation : . Remember! to take advantanges of TS we have to define the type of the response.
    
    ```tsx
    const responseUserPaginationBlank: UserPagination = {
      content: [],
      page: 0,
      size: 10,
      totalPage: 0,
    };
    
    test('returns page object as response body', async () => {
        const response = await request(app).get('/api/1.0/users');
        expect(response.body).toEqual(responseUserPaginationBlank);
      });
    ```
    

Ok, enough for the coding session. Now let’s write a blog! 

Ok now let’s get back to coding. 

## Page Content

- Now let’s ad user to databse and test our pagination functionality.  We don’t have to call our API to create a user, just create 11 users and call it.
    
    ```tsx
    test('returns 10 users in page content when there are 11 users in the database', async () => {
        for (let i=0; i < 11; i++) {
          const newUser: NewUser = {
            username: `user${i}`,
            email: `user${i}@gmail.com`,
            password: 'A4GuaN@SmZ',
          };
        
          await User.create(newUser);
        }
    
        const response = await request(app).get('/api/1.0/users');
        expect(response.body.content.length).toBe(10);
      });
    ```
    
- Now let’s write the implementation.
    - Sequilize has functionalities for it. it’s called `limit`
        
        ```tsx
        const userList = await User.findAll({
              limit: 10,
            });
        ```
        
    - Now it’s working.
- Now let’s test so the API only returns the active use. For example they are 11 accounts: 6 active, and 5 inactive. So the users only return these 6 active.
    - Now let’s write the test :
        
        ```tsx
        test('returns 6 active users in page content, when there are 6 active + 5 inactive users ', async () => {
            await addMultipleNewUsers(6, 5);
            const response = await getUser();
            expect(response.body.content.length).toBe(6);
          });
        ```
        
    - For the implementation we just add a `where` :
        
        ```tsx
        const userList = await User.findAll({
              where: { inactive: false },
              limit: 10,
            });
        ```
        
- Ok our implementation before we only return the users’ name, but in the course it returns several other thing, therefore, let’s write a test for it. It should fail since we only return user’s name.
    - Let’s write a test for it, so it only return id, username, and email. We have a type definition for this.
        - 
        
        ```tsx
        test('returns only id, username, email [UserDataFromDB] type in the content array', async () => {
            await addMultipleNewUsers(10);
            const response = await getUser();
            const user = response.body.content;
            expect(Object.keys(user[0])).toEqual(['id', 'username', 'email']);
          });
        ```
        
    - Here’s the implementation:  it’s very simple though in the sequilize there’s a built in function `attributes` for it
        
        ```tsx
        const userList = await User.findAll({
              where: { inactive: false },
              attributes: ['id', 'username', 'email'],
              limit: 10,
            });
        ```
        

## Total Page info

- the API should return the total page number, so for example there are 15 active users, then there are two pages for it. Now let’s create a test for it :
    
    ```tsx
    test('returns 2 as totalPages when there are 15 active and 7 inactiver users',async () => {
        await addMultipleNewUsers(15,7);
        const response = await getUser();
        expect(response.body.totalPages).toBe(2);
      });
    ```
    
- For the implementation we can use the built-in function from sequelize to find and count .  `findAndCountAll` . This will return an object with two properties : `rows` and `count` , Now let’s fix our implementation below:
    
    ```tsx
    public static async getAllActiveUser(): Promise<UserPagination>{
        const userList = await User.findAndCountAll({
          where: { inactive: false },
          attributes: ['id', 'username', 'email'],
          limit: 10,
        });
    
        const pageCount = UserHelperModel.getPageCount(userList.count);
    
        return await UserHelperModel.generateResUserPagination(userList.rows, pageCount);
      }
    
      public static getPageCount(userCount: number): number {
        return Math.ceil(userCount / USERS_PER_PAGE);
      }
    
      public static async generateResUserPagination(userList: User[], pageCount: number): Promise<UserPagination> {
        return {
          content: userList,
          page: 0,
          size: 10,
          totalPages: pageCount,
        };
      }
    ```
    
- 

## Changing Page

> Before we move further, please take a look at this : [rest - When do I use path params vs. query params in a RESTful API? - Stack Overflow](https://stackoverflow.com/questions/30967822/when-do-i-use-path-params-vs-query-params-in-a-restful-api) about how to use param and query.
> 

So far we only return one page, so let’s return several page for it. 

Let’s begin with the first test, in this test we’ll have two assertion: one to check the first content of the user name is `user11` and then the page of the body is `1` 

- test
    
    ```tsx
    test('returns 2nd page users and page indicator when page is set as 1 in req params',async () => {
        await addMultipleNewUsers(11);
        const response = await getUser(1);
        expect(response.body.content[0].username).toBe('user11');
        expect(response.body.page).toBe(1);
      });
    ```
    
    as you can see above, I change a little bit the function `getUser`, now it has parameter which the query page : 
    
    ```tsx
    async function getUser (page = 0) {
      if (page === 0) {
        return await request(app).get('/api/1.0/users');
      } 
      return await request(app).get('/api/1.0/users').query({page});
    }
    ```
    
- Now for the implementation first we have to fix our main controller to accept the query parameter right? As you can ee the implementation below, we ensure that variable page has always has number value, if the query page doesn’t exist then we’ll assign 0 to it.
    
    ```tsx
    public static async httpGetUsers(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void>{
        try {
          const page = Number(req.query.page) || 0;
          const users = await UserHelperModel.getAllActiveUser(page);
          res.status(200).send(users);
        } catch (err) {
          next(err);
          return;
        }
      }
    ```
    
- Now let’s nove to the helper function below :  As you can see below we add a properties in our queries `findAndCountAll` to add offset. Offset means that we’re going to start from that record. in this case the offset will be using formula : `page*USERS_PER_PAGE` . then we also
    
    ```tsx
    public static async getAllActiveUser(page: number): Promise<UserPagination>{
        const userList = await User.findAndCountAll({
          where: { inactive: false },
          attributes: ['id', 'username', 'email'],
          limit: 10,
          offset: page * USERS_PER_PAGE,
        });
    
        const pageCount = UserHelperModel.getPageCount(userList.count);
    
        return await UserHelperModel.generateResUserPagination(userList.rows, pageCount, page);
      }
    
      public static getPageCount(userCount: number): number {
        return Math.ceil(userCount / USERS_PER_PAGE);
      }
    
      public static async generateResUserPagination(
        userList: User[], 
        pageCount: number, 
        page: number
      ): Promise<UserPagination> {
        return {
          content: userList,
          page: page,
          size: 10,
          totalPages: pageCount,
        };
      }
    ```
    

Okay Now let’s move to the next test :  In this test we’re going to test for example the page parameter is below 0 or it’s gibberish : 

```tsx
test('returns first page when page is set below Zero as request parameter',async () => {
    await addMultipleNewUsers(11);
    const response = await getUser(-5);
    expect(response.body.page).toBe(0);
  });

  test('returns first page when page is set with giberish "asdf" as request parameter',async () => {
    await addMultipleNewUsers(11);
    const response = await request(app).get('/api/1.0/users').query({page: 'asdf'});
    expect(response.body.page).toBe(0);
  });
```

Here’s in our implementation before we pass it to the helper, we ensure if we pass number below 0, the number 0 will be set. 

```tsx
try {
      const page = Math.max ((Number(req.query.page) || 0), 0);
      const users = await UserHelperModel.getAllActiveUser(page);
      res.status(200).send(users);
    }
```

Now, let’s set up that when we start our application we’ll start with 25 users. 

In our `index.ts` we’re adding the `addMultipleNewUsers` 

## Changing Page Size

Just like changing page, we also want to allow to change the page size . 

Now let’s create the test first : 

- the test :
    
    ```tsx
    test('returns 5 users and corresponding size indicator when size is set as 5 in req param', async () => {
        await addMultipleNewUsers(11);
        const response = await getUserWithSize(5);
        expect(response.body.content.length).toBe(5);
        expect(response.body.size).toBe(5);
      });
    ```
    
    In this test we have two assertions, the first one to check whether the size of the content is 5, then the properties in the response size is 5 . 
    
- Implementation :
    - First of all in the main controller, we have to convert the query size into number first, and set a default number for it:
        
        ```tsx
        public static async httpGetUsers(
            req: Request,
            res: Response,
            next: NextFunction
          ): Promise<void>{
            try {
              const page = Math.max((Number(req.query.page) || 0), 0);
              const size = Math.max((Number(req.query.size) || 10), 0);
              const users = await UserHelperModel.getAllActiveUser(page, size);
              res.status(200).send(users);
            } catch (err) {
              next(err);
              return;
            }
          }
        ```
        
    - On then in the model helper. We now add information size to ensure that the model also take the `size` . and here we go:
        
        ```tsx
        public static async getAllActiveUser(page: number, size: number): Promise<UserPagination>{
            const userList = await User.findAndCountAll({
              where: { inactive: false },
              attributes: ['id', 'username', 'email'],
              limit: size,
              offset: page * size,
            });
        
            const totalPages = UserHelperModel.getPageCount(userList.count, size);
        
            return await UserHelperModel.generateResUserPagination(userList.rows, totalPages, page, size);
          }
        
          public static getPageCount(userCount: number, size: number): number {
            return Math.ceil(userCount / size);
          }
        
          public static async generateResUserPagination(
            userList: User[], 
            totalPages: number, 
            page: number,
            size: number
          ): Promise<UserPagination> {
            return {
              content: userList,
              page,
              size,
              totalPages,
            };
          }
        ```
        

Great, how how if for example our user set the API to be 1 million, then our pagination will be uselesss, so we want to use pagination to ensure that we only set the maximum pagination into 10. Also for example if the user send the size below than 1 than we are going to set it into 10.  Now let’s write a test for it . 

- test:
    
     
    
    ```tsx
    test('returns 10 users and corresponding size indicator when size is set as 1000 in req param', async () => {
        await addMultipleNewUsers(11);
        const response = await getUserWithSize(1000);
        expect(response.body.content.length).toBe(10);
        expect(response.body.size).toBe(10);
      });
    
      test('returns 10 users and corresponding size indicator when size is set as 0 in req param', async () => {
        await addMultipleNewUsers(11);
        const response = await getUserWithSize(0);
        expect(response.body.content.length).toBe(10);
        expect(response.body.size).toBe(10);
      });
    ```
    
- Implementation. The implementation lies heavily in the main controller, so we set the page & size before we pass it into the model helper function, and we refactor it so we simplify it:
    
    ```tsx
    public static async httpGetUsers(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void>{
        try {
          const { page, size }  = UserHelperController.settingPageAndSize(req);
          const users = await UserHelperModel.getAllActiveUser(page, size);
          res.status(200).send(users);
        } catch (err) {
          next(err);
          return;
        }
      }
    
      private static settingPageAndSize(req: Request) {
        return {
          page : UserHelperController.settingPage(req),
          size : UserHelperController.settingSize(req),
        };
      }
    
      private static settingPage(req: Request): number {
        return Math.max((Number(req.query.page) || 0), 0);
      }
    
      private static settingSize(req: Request): number {
        let size = Number(req.query.size) || MAX_SIZE;
        if (size > 10 || size < 1) size = 10;
        return size;
      }
    ```
    

Now let’s refactor our `httpGetUsers` and put the way we process page and size into middleware. 

Now let’s create a file named `paginationMW.ts` within our `middlewares` function : 

> we have to create a new definition type for request since we’re adding a new properties within it.
> 

```tsx
import { Response, NextFunction, RequestHandler} from 'express';
import { RequestWithPagination } from '../../models';

const MAX_SIZE = 10;

export function paginationMW(): RequestHandler {
  return function (
    req: RequestWithPagination, 
    res: Response, 
    next: NextFunction): void {
    req.pagination = settingPageAndSize(req);
    next();
  };
}

function settingPageAndSize(req: RequestWithPagination) {
  return {
    page : settingPage(req),
    size : settingSize(req),
  };
}

function settingPage(req: RequestWithPagination): number {
  return Math.max((Number(req.query.page) || 0), 0);
}

function settingSize(req: RequestWithPagination): number {
  let size = Number(req.query.size) || MAX_SIZE;
  if (size > 10 || size < 1) size = 10;
  return size;
}
```

Here’s the type :

```tsx
export interface RequestWithPagination extends Request {
  pagination?: {
    page: number,
    size: number,
  },
}
```

Now in the `user.controller` we add the middleware. Don’t forget to call the middleware since it’s a high order function 

```tsx
/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { routerConfig, post, get,  use } from '../../decorators';
import { UserHelperController } from './user.helper.controller';
import { bodyValidatorMW, 
  signUpSchema, 
  signUpValidationErrorGenerator,
  paginationMW 
} from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/users')
class UserController {
  @post('/', UserHelperController.httpPostSignUp)
  @use(bodyValidatorMW(signUpSchema, signUpValidationErrorGenerator, validationOption))
  usersPost(): void {}
  
  @post('/token/:token', UserHelperController.httpActivateAccount )
  usersTokenParams():void{}

  @get('/', UserHelperController.httpGetUsers)
  @use(paginationMW())
  usersGet(): void {}
}
```

Now, finally, in our implementation in the `httpGetUsers` we now can call the pagination properties within it. 

```tsx
public static async httpGetUsers(
    req: RequestWithPagination,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try {
      if (!req.pagination) {
        throw new Error('Pagination is not set properly');
      }
      const { page, size } = req.pagination;
      const users = await UserHelperModel.getAllActiveUser(page, size);
      res.status(200).send(users);
    } catch (err) {
      next(err);
      return;
    }
  }
```

## GetUser

Now let’s get a specific user, we have to use a unique identifier, and in this case we’re going to use `id` 

Now let’s create a test. 

- A test to return 404, when there’s no user found :
    
    ```tsx
    test.only('returns 404 when user not found', async () => {
        const response = await request(app).get('/api/1.0/users/5');
        expect(response.status).toBe(404);
      });
    ```
    
- This passes since express automatically sends `404` when there’s no matching path.

Now let’s add the test, where the test have a message returns back when user not found. This time we are also going to use the translatation : 

- The test

```tsx
test.only.each`
  language      | message
  ${'id'}       | ${'Pengguna tidak ditemukan'}
  ${'en'}       | ${'User not found'}
  `('returns $message for unknown user when language is set to $language', async ({language, message}) => {
    const response = await request(app).get('/api/1.0/users/5').set('Accept-Language', language);
    expect(response.body.message).toBe(message);
  });
```

- Implementation :
    - First of all we create a route to handle this request in the main controller
        
        ```tsx
        @routerConfig('/api/1.0/users')
        class UserController {
          @post('/', UserHelperController.httpPostSignUp)
          @use(bodyValidatorMW(signUpSchema, signUpValidationErrorGenerator, validationOption))
          usersPost(): void {}
          
          @post('/token/:token', UserHelperController.httpActivateAccount )
          usersTokenParams():void{}
        
          @get('/', UserHelperController.httpGetUsers)
          @use(paginationMW())
          usersGet(): void {}
        
          @get('/:id', UserHelperController.httpGetUserById)
          userGetById(): void {}
        }
        ```
        
    - Now let’s write the implementation so it could pass the test:
        
        ```tsx
        public static async httpGetUserById(
            req: Request,
            res: Response,
            next: NextFunction
          ): Promise<void> {
            res.status(404).send({
              message: req.t(Locales.userNotFound),
            });
            return;     
          }
        ```
        

Ok now it passes. 

Now let’s test that the error response is our generic error response that we already determined before hand. Remember? 

```tsx
test.only('returns proper error body when user not found', async () => {
    const nowToMillis = new Date().getTime();
    const response = await request(app).get('/api/1.0/users/5');
    const error = response.body;
    expect(error.path).toBe('/api/1.0/users/5');
    expect(error.timeStamp).toBeGreaterThan(nowToMillis);
    expect(Object.keys(error)).toEqual(['path', 'timeStamp', 'message']);
  });
```

Then in our implementation we have to set up the error class first, and then in the errorHandle we put the implementation : 

ErrorClass.ts 

```tsx
export class ErrorUserNotFound extends Error {
  public code = 404;
  constructor(message = Locales.userNotFound) {
    super(message);
  }
}
```

Then we put it in the implementation for error handle . Since the treatment it’s quite the same with ErrorToken and also ErrorSendEmailActivation, then we put it in the same category 

```tsx
if (
    err instanceof ErrorSendEmailActivation || 
    err instanceof ErrorToken || 
    err instanceof ErrorUserNotFound
  ){
    res.status(err.code).send(generateResponse(path, req.t(err.message)));
    return;
  }
```

Now for a while in the implementation in the main controller we just throw the exception : 

```tsx
public static async httpGetUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {
      throw new ErrorUserNotFound();
      return;
    } catch (err) {
      next(err);
      return;
    }  
  }
```

Before move to another test, let’s refactor our test, for the request to the API into a single function like this : 

```tsx
async function getUserByID(id: number, option: optionPostUser = {}) {
  const agent = request(app).get(`/api/1.0/users/${id}`);
  if (option.language) {
    agent.set('Accept-Language', option.language);
  }

  return await agent;
}
```

Now let’s write a test for a success case : 

- Test: If the user exist then return 200 :
    
    ```tsx
    test('returns 200 okay when an active user exist', async () => {
        const userList = await addMultipleNewUsers(2);
        const response = await getUserByID(userList[0].id);
        expect(response.status).toBe(200);
      });
    ```
    
- In the implementation first in the `user.helper.model.ts` we write the implementation of the function `getUserById` : at the moment let’s return everthing.
    
    ```tsx
    public static async getUserByID(id: number) {
        const user = User.findOne({where: {id}});
        return user;
      }
    ```
    
- now in the controller helper, let’s return 200 status code okay
    
     
    
    ```tsx
    public static async httpGetUserById(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> {
    
        try {
          const id = Number(req.params.id);
          const user = await UserHelperModel.getUserByID(id);
          if (!user) {
            throw new ErrorUserNotFound();
          }
    
          res.status(200).send();
          return;
        } catch (err) {
          next(err);
          return;
        }  
      }
    ```
    

Now let’s return the id, username, and email if the user exists 

```tsx
test('returns id, username, email in response an active user exist', async () => {
    const userList = await addMultipleNewUsers(1);
    const response = await getUserByID(userList[0].id);
    expect(Object.keys(response.body)).toEqual(['id', 'username', 'email']);
  });
```

First in our implementation we have to set how we return data in the `User.helper.model.ts`

```tsx
public static async getUserByID(idParams: number): Promise<UserDataFromDB | null> {
    const user = await User.findOne({
      where: {
        id: idParams,
        inactive: false,
      },
    });

    if (!user) {
      return null;
    }
    const { id, username, email } = user;
    return { id, username, email };
  }
```

Now after we sure that we send the proper data type, in this case `UserDataFromDB`

now we modify our controller helper to fix it ; 

```tsx
public static async httpGetUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {
      const id = Number(req.params.id);
      const user = await UserHelperModel.getUserByID(id);
      if (!user) {
        throw new ErrorUserNotFound();
      }

      res.send(user);
      return;
    } catch (err) {
      next(err);
      return;
    }  
  }
```

Now the final test, where we have our user is inactive. 

```tsx
test('returns 404 when the user is inactive', async () => {
    const userList = await addMultipleNewUsers(0,1);
    const response = await getUserByID(userList[0].id);
    expect(response.status).toBe(404);
  });
```

It should pass, because in our implementation before we already set the properties. 

# Authentication

- Authentication ⇒ Verifying the identity of a user
- Authorization ⇒ Determining what that user is allowed to do once their identity has been verified.

## Authentication

Let’s create a new test module: `Auth.test.ts` 

Now let’s initialize the test and add our first test.  We write a test to return 200 status code when credentials are correct : 

```tsx
import request from 'supertest';
import { app } from '../app';
import { User, UserHelperModel, CredentialBody} from '../models';
import { sequelize } from '../config/database';

beforeAll( async () => {
  await sequelize.sync();
});

beforeEach( async () => {
  await User.destroy({truncate: true});
});

afterAll(async () => {
  await sequelize.close();
});

const emailUser1 = 'user1@gmail.com';
const passwordUser1 = 'A4GuaN@SmZ';
const API_URL_POST_AUTH = '/api/1.0/auth';

async function postAuthentication(credentials: CredentialBody) {
  return await request(app).post(API_URL_POST_AUTH).send(credentials);
}

async function postAuthenticationUser1() {
  return await postAuthentication({
    email: emailUser1,
    password: passwordUser1,
  });
}

describe('Authentication', () => {
  test('returns 200 when credentials are correct', async() => {
    await UserHelperModel.addMultipleNewUsers(1);
    const response = await postAuthenticationUser1();
    expect(response.status).toBe(200);
  });
});
```

Now let’s work on the implementation 

First let’s create folder named `auth` under the folder `controllers` then we creates two files: `auth.controller.ts` and the second one `auth.helper.controller.ts` .

`auth.controller.ts` : ⇒ there are several unuse thing there, but we’ll visit this later 

```tsx
/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { routerConfig, post, get,  use } from '../../decorators';

import { AuthHelperController } from './auth.helper.controller';

import { bodyValidatorMW
} from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/auth')
class AuthController {
  @post('/', AuthHelperController.httpPostAuth)
  authPost(): void {}
  // @use(bodyValidatorMW(signUpSchema, signUpValidationErrorGenerator, validationOption))
  
}
```

then in the `auth.helper.controller.ts` 

```tsx
import { Request, Response, NextFunction } from 'express';

export class AuthHelperController { 
  public static async httpPostAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.send();
  }
}
```

Ok now don’t forget to update the `index.ts` file in the `controllers` folder .  Ensure that we import all the controllers and also export the helper : 

```tsx
//import all the routes
import './user/user.controller';
import './auth/auth.controller';

//export all the helper controller
export * from './user/user.helper.controller';
export * from './auth/auth.helper.controller';
```

Okay, now we pass the test. 

Now let’s create a test to ensure that it returns the user name and ID only, we haven’t check the database yet. 

```tsx
test('returns only user id and user name when login success', async() => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    const response = await postAuthenticationUser1();
    expect(response.body.id).toBe(user[0].id);
    expect(response.body.username).toBe(user[0].username);
    expect(Object.keys(response.body)).toEqual(['id', 'username']);
  });
```

Now in the implementation we only find the user and then returned it. 

```tsx
export class AuthHelperController { 
  public static async httpPostAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const {email} = req.body;

    const user = await UserHelperModel.findUserByEmail(email);

    if (!user?.id && !user?.username) {
      throw new Error('error');
    }
    
    const response: ResponseAfterSuccessfulAuth = {
      id: user?.id,
      username: user?.username,
    };

    res.send(response);
  }
}
```

Yup that’s it. 

## Authentication Failure

Now let’s create Authentication Failure, let’s start with return 401 when user doesn’t exist : 

Here’s the test 

```tsx
test('returns 401 when user doesn\'t exist', async() => {
    const response = await postAuthenticationUser1();
    expect(response.status).toBe(401);
  });
```

And in the implementation we just send 401 error if the user doesn’t exist. The best way to do this is to throw error, and handle it in the begining. However, I don’t like this process, since it should check the body validation first before we check others. 

```tsx
import { Request, Response, NextFunction } from 'express';
import { ResponseAfterSuccessfulAuth, UserHelperModel } from '../../models';

export class AuthHelperController { 
  public static async httpPostAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const {email} = req.body;

    const user = await UserHelperModel.findUserByEmail(email);

    if (!user) {
      res.status(401).send();
      return;
    }
    
    const response: ResponseAfterSuccessfulAuth = {
      id: user.id,
      username: user.username,
    };

    res.send(response);
  }
}
```

Now let’s return our error generic response : 

here’s the test : 

```tsx
test('returns proper error body when authentication fails', async () => {
    const nowInMilis = new Date().getTime();
    const response = await postAuthenticationUser1();
    const error = response.body;

    expect(error.path).toBe('/api/1.0/auth');
    expect(error.timeStamp).toBeGreaterThan(nowInMilis);
    expect(Object.keys(error)).toEqual(['path', 'timeStamp', 'message']);

  });
```

Now for the implementation we create the error class first. First we don’t have to worry about the message and only focus on the body and also the error code : 

```tsx
export class ErrorAuthFailed extends Error {
  public code = 401;
  constructor(message = 'yeah') {
    super(message);
  }
```

Then now let’s add ErrorAuthFailed in the error handle 

```tsx
if (
    err instanceof ErrorSendEmailActivation || 
    err instanceof ErrorToken || 
    err instanceof ErrorUserNotFound ||
    err instanceof ErrorAuthFailed
  ){
    res.status(err.code).send(generateResponse(path, req.t(err.message)));
    return;
  }
```

Now in the controller we just need to throw the error :  we use try catch, and put the error in the next function

```tsx
export class AuthHelperController { 
  public static async httpPostAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {email} = req.body;
      const user = await UserHelperModel.findUserByEmail(email);
  
      if (!user) {
        throw new ErrorAuthFailed();
      }
      
      const response: ResponseAfterSuccessfulAuth = {
        id: user.id,
        username: user.username,
      };

      res.send(response);
    }
    catch (err) {
      next(err);
    }
  }
}
```

Now let’s test the message using the internationalisation  : 

Now please take a look, that we modify our `postAuthenticationUser` to have an argument language. Therefore we can put language as the argumen

```tsx
test.each`
  language        | message
  ${'id'}         | ${'Kredensial tidak valid'}
  ${'en'}         | ${'Incorrect credential'}
  `('returns $message when authentication fails and language is set as $language', async ({language, message}) => {
    const response = await postAuthenticationUser1({language});
    expect(response.body.message).toBe(message);
  });
```

Then let’s add `enum` and translation. I don’t have to write it down right? My future me. 

Okay now let’s add something to the Error class: 

```tsx
export class ErrorAuthFailed extends Error {
  public code = 401;
  constructor(message = Locales.authFailure) {
    super(message);
  }
}
```

Perfect now they all will pass the test. 

Now let’s add more case for authentication error , if the password is wrong then we’re going to send the `401` in our case we don’t check then and just return it eventhough it’s wrong password : 

```tsx
test('returns 401 when password is wrong', async () => {
    await UserHelperModel.addMultipleNewUsers(1);
    const response = await postAuthenticationWrongPassword();
    expect(response.status).toBe(401);
  });
```

> REMEMBER: YOU HAVE TO INSTALL express-session if you are using passport, otherwise it’s going to have an error!!!! 
REMEMBER: also to download `connect-flash` if you’d like to pass information.
> 

Let’s use `password.js` for authentication, in the tutorial, it’s simply using simple checking. so let’s get it. 

- First let’s install several dependencies
    - `npm i passport`
    - `npm i @types/passport --save-dev`
    - `npm i passport-local`
    - `npm i @types/passport-local --save-dev`
    - `npm i express-session`
    - `npm i @types/express-session --save-dev`
    - `npm i connect-flash`
    - `npm i @types/connect-flash` —save-dev
- 

Okay, it’s too long here but here’s the set up : 

- Config session first susing `express-session` , then we config the `passport.js`
- Then let’s put the configuration of `passport.js` in the middleware before the routes  `post : auth` .
- then don’t forget to ensure that we handling of the error of the localAuthFailure

so the controller will be like this : 

```tsx
import { Request, Response, NextFunction } from 'express';
import { ResponseAfterSuccessfulAuth, User} from '../../models';
import { ErrorAuthFailed } from '../../utils';

export class AuthHelperController { 
  public static async httpPostAuth(
    req: Request & {user?: User},
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {

      if (!req.user) {
        next(new ErrorAuthFailed());
        return;
      }
  
      const response: ResponseAfterSuccessfulAuth = {
        id: req.user.id,
        username: req.user.username,
      };
  
      res.send(response);
      return;
    }
    catch (err) {
      next(err);
    }
  }

  public static async localAuthFailure(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    next(new ErrorAuthFailed());
    return;
  }
  
}
```

Now let’s do the test to check if the user is inactive, then we have to return 403 forbidden 

```tsx
test('returns 403 when logging in with an inactive account', async() => {
    await UserHelperModel.addMultipleNewUsers(0,1);
    const response = await postAuthenticationUser1();
    expect(response.status).toBe(403);
  });
```

First we have to enable flash first. 

then in the `app.js` we have to define our implementation for local auth : 

```tsx
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
    }
    );
  }
```

then we catch the error in the controller : 

```tsx
public static async localAuthFailure(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    if (req.flash('error')[0] === 'inactive') {
      next(new ErrorForbidden());
      return;
    }
  
    next(new ErrorAuthFailed());
    return;
  }
```

ok now let’s test when to check the response body : 

```tsx
test('returns proper error body when user inactive authentication fails', async () => {
    await UserHelperModel.addMultipleNewUsers(0,1);
    const nowInMilis = new Date().getTime();
    const response = await postAuthenticationUser1();
    const error = response.body;

    expect(error.path).toBe('/api/1.0/auth/localFailure');
    expect(error.timeStamp).toBeGreaterThan(nowInMilis);
    expect(Object.keys(error)).toEqual(['path', 'timeStamp', 'message']);
  });
```

That should pass easily. 

Now let’s test for the error message for account is inactive. 

```tsx
test.each`
  language        | message
  ${'id'}         | ${'Akun anda belum diaktifkan'}
  ${'en'}         | ${'Account is inactive'}
  `('returns $message when authentication fails and language is set as $language', async ({language, message}) => {
    await UserHelperModel.addMultipleNewUsers(0,1);
    const response = await postAuthenticationUser1({language});
    expect(response.body.message).toBe(message);
  });
```

okay now let’s work with the enum, translation, etc, then it add the code string for the error in the error class. 

Then it should pass.

Now, let’s check for the body validation.  ( I think this is should be in the beginning) . 

## Refactoring Tests

In the current test, there are a lot of hardcoded things particularly for error message. 

we can import JSON file though at TS. 

- First, I have to move the `locales` folder to the `src` folder. So TS can reach the folder
- Then for the internaziolatiaon I have to change the set up, so it’s looking the `locales` folder within the `src` folder.
- Then we have to enable the Json Module
    
     
    
    ```tsx
    "resolveJsonModule": true,
    ```
    
- Then here’s how to import it like an object :
    
    ```tsx
    import en from '../locales/en/translation.json';
    import id from '../locales/id/translation.json';
    ```
    

Now we can use it like a JavaScript Object. 

## Body Validation

Now I’m going to add body validation to check whether this is a valid email address and also the password is not empty. 

Ok let’s try to do the tdd process. 

It’s done. 

## Update user - Authentication Failure

In the front end, we have the ability to edit the user. Now let’s create a test for it: 

- Let’s create a new test file named `UserUpdate.test.ts`
    
    ```tsx
    describe('User Update', () => {
      test('returns forbideen when request sent without basic auth', async() => {
        const response = await request(app).put('/api/1.0/users/5').send();
        expect(response.status).toBe(403);
      });
    });
    ```
    
- This is still under the `user` router, therefore let’s add route there
    
    ```tsx
    @routerConfig('/api/1.0/users')
    class UserController {
      @post('/', UserHelperController.httpPostSignUp)
      @use(bodyValidatorMW(signUpSchema, validationErrorGenerator, validationOption))
      usersPost(): void {}
      
      @post('/token/:token', UserHelperController.httpActivateAccount )
      usersTokenParams():void{}
    
      @get('/', UserHelperController.httpGetUsers)
      @use(paginationMW)
      usersGet(): void {}
    
      @get('/:id', UserHelperController.httpGetUserById)
      userGetById(): void {}
    
      @put('/:id', UserHelperController.httpPutUserById )
      userPutById(): void {}
    
    }
    ```
    
- Now let’s define a function to return `403` :
    
    ```tsx
    public static async httpPutUserById(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> {
        try {
          res.status(403).send();
        } catch(err) {
          next(err);
        }
      }
    ```
    

Now let’s create a test so it returns a proper error message :  

```tsx
test.each`
  language    | message
  ${'en'}     | ${en.unauthorizedUserUpdate}
  ${'id'}     | ${id.unauthorizedUserUpdate}
  `('return error body with "$message" for unauthrized request when language is "$language"', 
  async({language, message}) => {
    const nowInMilis = new Date().getTime();
    const response = await request(app).put('/api/1.0/users/5')
      .set('Accept-Language', language)
      .send();
    expect(response.body.path).toBe('/api/1.0/users/5');
    expect(response.body.timeStamp).toBeGreaterThan(nowInMilis);
    expect(response.body.message).toBe(message);
  });
```

Now what we do is first we have to modify our previous error class for inactive account to be like this :  I just change the name so it’s more descriptive. 

```tsx
export class ErrorAuthForbidden extends Error {
  public code = 403;
  //the default is for inactive account
  constructor(message = Locales.inactiveAccount) {
    super(message);
  }
}
```

Then I just need to throw it in the controller: 

```tsx
public static async httpPutUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
    } catch(err) {
      next(err);
    }
  }
```

the next step is to test if it’s still send 403 when we send wrong credential : 

```tsx
test('returns forbidden when request send with incorrect email in basic auth', async () => {
    await UserHelperModel.addMultipleNewUsers(1);
    const response = await putUser(5, undefined, {auth : { email : 'user1000@gmail.com', password: 'password'} });
    expect(response.status).toBe(403);
  });
```

Please notice, that in our `putUser` function we modify it a little bit, so it looks like this : 

Anyway, I have no idea what is the `auth` function from the super test here. I guess I have to put it in my list. 

```tsx
async function putUser(
  id = 5, 
  body: string | object | undefined = undefined, 
  options: optionPostUser = {}
){
  const agent = request(app).put(`/api/1.0/users/${id}`);
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }

  const { email, password } = options.auth || {};

  if (email && password) {
    agent.auth(email, password);
  }

  return await agent.send(body);
}
```

> JET TIME OUT: Sometime our test is taking a little bit longer, and jest will return error if it’s the case. Therefore we can set a timeout for the test that is going to take a long time how? 
`jest.setTimeout(20000);` 
In the before all  and then after all. for the test file that we think that it’s going to take a long time.
> 

Okay, now let’s create a test to return `403` when we send a wrong password : 

```tsx
test('returns forbidden when request send with incorrect pass in basic auth', async () => {
    await UserHelperModel.addMultipleNewUsers(1);
    const response = await putUser(5, undefined, {auth : { email : 'user1@gmail.com', password: 'password'} });
    expect(response.status).toBe(403);
  });
```

Of course this will pass, since no matter what in our controller we only throw error 403. 

Ok now let’s another test that the test returns forbidden when the request is the correct credential but for dirrerent user.  so the test below we’re going to create two user right? Now in the option we’re sending the id of user 2, but the credential body is for the user 1. 

```tsx
test('returns forbidden when update request is sent with correct credential but for different user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(2);
    const response = await putUser(
      userList[1].id, 
      undefined, 
      {auth : { 
        email : 'user1@gmail.com', 
        password: 'A4GuaN@SmZ',
      }}
    );
    expect(response.status).toBe(403);
  });
```

Now let’s update one more test, that when the request is a valid credential, but the user is inactive: 

```tsx
test('returns forbidden when update request is sent by inactive user with correct credential', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(0,1);
    const response = await putUser(
      userList[0].id, 
      undefined, 
      {auth : { 
        email : 'user1@gmail.com', 
        password: 'A4GuaN@SmZ',
      }}
    );
    expect(response.status).toBe(403);
  });
```

## Update user  Success

Now let’s implement success scenarion : 

```tsx
test('returns 200 ok when valid update request sent from authorized user', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1, 0);
    const validUpdate = { username: 'user1-updated' };
    const response = await putUser(
      userList[0].id, 
      validUpdate, 
      {auth : { 
        email : emailUser1, 
        password: passwordUser1,
      }}
    );

    expect(response.status).toBe(200);

  });
```

In the mean time we only check whether the request has the authorization header.

If it has the Authorization request then we will return 200. 

```tsx
public static async httpPutUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authorization = req.headers.authorization;
      if (authorization) {
        res.send();
      }
      throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
    } catch(err) {
      next(err);
    }
  }
```

However this will break things. since many of the test send the authorization header. 

Now let’s implement the solution to check on the database. 

In this solution we are 

```tsx
public static async httpPutUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authorization = req.headers.authorization;
      if (authorization) {
        const encoded = authorization.substring(6);
        const decoded = Buffer.from(encoded, 'base64').toString('ascii');
        const [email, password] = decoded.split(':');
        const user = await UserHelperModel.findUserByEmail(email);
        if (!user) {
          throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
        }

        if (user.id !== Number(req.params.id)) {
          throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
        }

        if (user.inactive) {
          throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
        }

        const match = bcrypt.compare(password, user.password);

        if(!match){
          throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
        }

        res.send();
      }
      throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
    } catch(err) {
      next(err);
    }
  }
```

Now the test passes. But I don’t like it, it’s a mess. 

But let’s refactor it later. 

Now let’s move on to the next test. In this this test, we’re going to check whether it’s updating the data: 

```tsx
test('it updates username in the database when valid update request sent', async() => {
    const userList = await UserHelperModel.addMultipleNewUsers(1, 0);
    const validUpdate = { username: 'user1-updated' };
    await putUser(
      userList[0].id, 
      validUpdate, 
      {auth : { 
        email : emailUser1, 
        password: passwordUser1,
      }}
    );

    const updatedUser = await UserHelperModel.getActiveUserByid(userList[0].id);
    expect(updatedUser?.username).toBe(validUpdate.username);
  });
```

It’s very simple though, what we need to do is to update the controller like this : 

```tsx
await UserHelperModel.updateUserByID(id, updateObject);
        res.send();
```

and in the  helper model we add this function : 

```tsx
public static async updateUserByID(idParams: number, updateObject: updateUserObject ): Promise<void> {
    const user = await this.getActiveUserByid(idParams);

    if (!user) {
      throw new ErrorUserNotFound();
    }

    user.set(updateObject);

    await user.save();

  }
```

Now let’s refactor it : 

1. First we move the parsing basic Authentication to the middleware. 
    1. First it’s going to parse the authentication header
    2. find the user 
    3. check if the user is active 
    4. check if the password is correct 
    5. then set properties `authenticatedUser` in the request object. 
2. Then in the controller we only check whether `authenticatedUser` is available, and also the `id` of the `authenticatedUser` is the same with the `id` that the user wants to update. 

Now, let’s add a body validator for our app, so when the body is not valid, we’re going to throw 400 status error with the error body message. 

Ok, You can check in the git hub about this, but now let’s move to another section first. 

## Authorization Aware User List

Ok, now let’s move to the next test. In the UserListing test, we’re going to add a test that in the client when we login, we don’t list the user current name in the list. 

> Remember, in order to list all of the user, we don’t have to login. 
however, when we log in, we’d like to ensure that the logged in user is not in the list.
> 

so in the `UserListing.test` , we add this test in the group of listing user :

```tsx
test('returns user page without logged-in user when request has valid authorization', async() => {
    await addMultipleNewUsers(11);
    const response = await getUser(0, {
    auth: {email: emailUser1,
      password: passwordUser1,
    },
    });
    expect(response.body.totalPages).toBe(1);
  });
```

Now it should failed since there are 11 users, and it should return 2 pages.

However since we don’t want the logged-in user to be logged, then we just need 10 user which mean only 1 page. 

So what should we do ? 

- First of call we modify our controller, the controller should take `authenticatedUser` from the request : `const users = await UserHelperModel.getAllActiveUser(page, size, authenticatedUser);`
    
     
    
    ```tsx
    public static async httpGetUsers(
        req: RequestWithPagination & RequestWithAuthenticatedUser,
        res: Response,
        next: NextFunction
      ): Promise<void>{
        try {
          if (!req.pagination) {
            throw new Error('Pagination is not set properly');
          }
          const authenticatedUser = req.authenticatedUser || undefined;
          const { page, size } = req.pagination;
          const users = await UserHelperModel.getAllActiveUser(page, size, authenticatedUser);
    
          res.status(200).send(users);
          return;
        } catch (err) {
          next(err);
          return;
        }
      }
    ```
    
- Then in the `model` helper we add the `whereClause` :
    
    ```tsx
    public static whereClauseForGetAllActiveUser(authenticatedUser: User | undefined) {
        const  whereClause: WhereOptions<InferAttributes<User, { omit: never }>> | undefined = {
          inactive: false,
        };
    
        if (authenticatedUser?.id !== undefined) {
          whereClause.id = { [Op.not]: authenticatedUser.id };
        }
    
        return whereClause;
      }
    ```
    
- Then we called the function above in the `getAllUsers`
    
    ```tsx
    public static async getAllActiveUser(
        page: number, 
        size: number, 
        authenticatedUser: User | undefined
      ): Promise<UserPagination>{
    
        const whereClause = UserHelperModel.whereClauseForGetAllActiveUser(authenticatedUser);
    
        const userList = await User.findAndCountAll({
          where: whereClause,
          attributes: ['id', 'username', 'email'],
          limit: size,
          offset: page * size,
        });
    
        const totalPages = UserHelperModel.getPageCount( userList.count, size);
    
        return UserHelperModel.generateResUserPagination(
          userList.rows, 
          totalPages, 
          page, 
          size);
      }
    ```
    

Done

## JWT Token Generation

- We’re using basic authentication, but it’s not the best way to secure our application, we are just encoding our credentials with base64.
- When we do the authorization, it’s in the header, and we can just decode it. using tools like this : [Base64 Decode and Encode - Online](https://www.base64decode.org/)
- We don’t use secure connection between the client and the server, then the credential can be stolen.
- There are also disadvantanges like users just can create the base64 encoded values and add it to their authorization header in their request.

An alternative solution is to generate a token for user and expect that token to be added to each request by the client. We will do that we will general JSON WebSocket Token. 

In our application, nothing much changes, we will change our basic authentication middleware with another one where instead of decoding and querying the user based on this authentication header, we will be checking the validity of the incoming JWT token. 

First we need to return the token back to client for authentication request. Let’s start with that :

- First we create a test that the server will send the token
    - 
    
    ```tsx
    test('returns token in response body when credentials are correct', async() => {
        await UserHelperModel.addMultipleNewUsers(1);
        const response = await postAuthenticationUser1();
        expect(response.body.token).not.toBeUndefined();
      });
    ```
    
- In order to perform this, we need to use a library.
    - `npm install jsonwebtoken`
    - `npm i @types/jsonwebtoken --save-dev`
- Now let’s move the implementation:
    - First we import it :
        
        ```tsx
        import jwt from 'jsonwebtoken';
        ```
        
    - Then in the implementation we add the token by using `jwt.sign` :
        - 
        
        ```tsx
        public static async httpPostAuth(
            req: Request & {user?: User},
            res: Response,
            next: NextFunction
          ): Promise<void> {
            try {
        
              if (!req.user) {
                next(new ErrorAuthFailed());
                return;
              }
        
              const token = jwt.sign(
                {id: req.user.id},
                'this-is-our-secret'
              );
          
              const response: ResponseAfterSuccessfulAuth = {
                id: req.user.id,
                username: req.user.username,
                token,
              };
          
              res.send(response);
              return;
            }
            catch (err) {
              next(err);
            }
          }
        ```
        
- However our other test will fail now. the test that check the response from the server is only id, and username. We have to add something more.
- Then we refactor the token generation into it’s own function. and also put the key into the environment variable.

## Authorization

Now let’s replace our authorization with JWT 

In the `UserUpdate.test.ts` . There’s a function `putUser` : let’s change it to have authorization header : 

```tsx
async function putUser(
  id = 5, 
  body: string | object | undefined = validUpdate, 
  options: optionPostUser = {}
){

  const agent = request(app);
  let token: string | undefined = undefined;

  if (options.auth) {
    const response = await agent.post('/api/1.0/auth').send(options.auth);
    token = response.body.token;
  }

  const agent2 = request(app).put(`/api/1.0/users/${id}`);
  if (options.language) {
    agent2.set('Accept-Language', options.language);
  }

  if (token) {
    agent2.set('Authorization', `Bearer ${token}`);
  }

  return await agent2.send(body);
}
```

By changing this, the test will failed in the User Update. Since in our controller we need to accept the authentication. However we didn’t send any authentication in this case. 

So what’s the implementation. The best way for the implemenation is to create a new middleware to check for authorization. 

Here’s the implementation of the middleware:  `tokenAuthenticationMW.ts` 

```
import { RequestWithAuthenticatedUser, UserWithIDOnly } from '../../models';
import { Response, NextFunction } from 'express';
import { verifyJWTToken } from '../tokenService';

export async function tokenAuthenticationMW(
  req: RequestWithAuthenticatedUser,
  res: Response,
  next: NextFunction
): Promise<void> {

  const authorization = req.headers.authorization;
  
  if (authorization) {
    const token = authorization.substring(7);
    const user = verifyJWTToken(token);
    if (user) {
      req.authenticatedUser = user as UserWithIDOnly;
    }
  }

  next();
}
```

Here’s the function of the `verifyJWTToken` :

```tsx
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.jwtkey) {
  throw new Error('Please set up the JWT key in the env');
}

const jwtKey = process.env.jwtkey;

export function verifyJWTToken(token: string) {
  return jwt.verify(token, jwtKey);
}
```

I have to use : `req.authenticatedUser = user as UserWithIDOnly;` 

since I don’t know how to implement that. In the mean time, it works . How I’ll put it in the . I create a github issue for this. 

Now let’s add the case when the token is invalid in the `UserUpdate.test` : 

```tsx
test('returns 403 when token is not valid', async() => {
    const response = await putUser(5, {}, {token: '123'});
    expect(response.status).toBe(403);
  });
```

Let’s also change the function for putUser into like this : 

⇒ So it the option has the `token` then we’ll be replace it. 

```tsx
async function putUser(
  id = 5, 
  body: string | object | undefined = validUpdate, 
  options: optionPostUser = {}
){

  const agent = request(app);
  let token: string | undefined = undefined;

  if (options.auth) {
    const response = await agent.post('/api/1.0/auth').send(options.auth);
    token = response.body.token;
  }

  const agent2 = request(app).put(`/api/1.0/users/${id}`);
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
```

Here’s the implementation : 

- first we refactor the  `tokenAuthenticationMW.ts`
    - In this we wrap it with Try - error. And if it’s error we’re doing nohting.
    
    ```tsx
    import { RequestWithAuthenticatedUser, UserWithIDOnly } from '../../models';
    import { Response, NextFunction } from 'express';
    import { verifyJWTToken } from '../tokenService';
    import { ErrorHandle, ErrorAuthForbidden } from '../Errors';
    import { Locales } from '../../utils';
    
    export async function tokenAuthenticationMW(
      req: RequestWithAuthenticatedUser,
      res: Response,
      next: NextFunction
    ): Promise<void> {
    
      const authorization = req.headers.authorization;
      
      if (authorization) {
        const token = authorization.substring(7);
        try {
          const user = verifyJWTToken(token);
          if (user) {
            req.authenticatedUser = user as UserWithIDOnly;
          }
        // eslint-disable-next-line no-empty
        } catch (error) {
    
        }
      }
    
      next();
    }
    ```
    

Now let’s check the part when we also use user authentication. It’s in the user listing right? 

Ok now let’s add the test in the returns user page without logged-in user : 

```tsx
test('returns user page without logged-in user when request has valid authorization', async() => {
    await addMultipleNewUsers(11);
    const token = await auth({
      auth: {
        email: emailUser1,
        password: passwordUser1,
      },
    });

    const response = await getUser(0, {
    auth: {email: emailUser1,
      password: passwordUser1,
    },
    token,
    });
    expect(response.body.totalPages).toBe(1);
  });

});
```

We’re adding the function `auth` to get the token, and also to modify the getUser 

```tsx
async function getUser (page = 0, options: optionAuth = {} ) {
  const agent = request(app).get('/api/1.0/users').query({page});

  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }

  return await agent;
}

async function auth(options: optionAuth){
  let token: string | undefined = undefined;

  if (options.auth) {
    const response = await request(app).post('/api/1.0/auth').send(options.auth);
    token = response.body.token;
  }

  return token;
}
```

Now this is going to faile since we don’t check for the token, we’re still using the old basicAuthentication. 

Now what we need to do is just to remove the `basicAuthenticationMW` and replace if tiwht `tokenAuthenticationMW` 

very simple huh? 

```tsx
/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { routerConfig, post, get, use, put } from '../../decorators';
import { UserHelperController } from './user.helper.controller';
import { bodyValidatorMW, 
  signUpSchema, 
  validationErrorGenerator,
  paginationMW,
  basicAuthenticationMW,
  userUpdateSchema,
  tokenAuthenticationMW
} from '../../utils';

const validationOption = {abortEarly: false};

@routerConfig('/api/1.0/users')
class UserController {
  @post('/', UserHelperController.httpPostSignUp)
  @use(bodyValidatorMW(signUpSchema, validationErrorGenerator, validationOption))
  usersPost(): void {}
  
  @post('/token/:token', UserHelperController.httpActivateAccount )
  usersTokenParams():void{}

  @get('/', UserHelperController.httpGetUsers)
  @use(tokenAuthenticationMW)
  @use(paginationMW)
  usersGet(): void {}

  @get('/:id', UserHelperController.httpGetUserById)
  userGetById(): void {}

  @put('/:id', UserHelperController.httpPutUserById )
  @use(tokenAuthenticationMW)
  @use(bodyValidatorMW(userUpdateSchema, validationErrorGenerator, validationOption))
  userPutById(): void {}
}
```

## JWT Practices

we can set the expired time for the token. 

For example, we set this token to be expired in 10 second:

```
export function createJWTToken(id: number) {
  return jwt.sign(
    {id},
    jwtKey,
    {expiresIn: 10}
  );
}
```

For 2 days we can set like this :    `{expiresIn: '2d'}` 

Now for Micro Services Architecture: 

> We can use the token as for several services. This what makes `JWT` is really popular.
> 

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/7bfa8f39-dda3-493e-b7c6-65a1668ca79a/Untitled.png)

The disadvantange of JWT is:

- if our `secret` is compromised then everyone can generate token.
- There’s no logout mechanism. So if you have the token and it’s valid, there’s no way to invalidate it.
- If the user is removed, the token is still valid until it’s expired. No correlation between the existance of the user and the token.

> So instead of JWT, we will implement a token for a user and we will store it in a database . 
So whenever user authenticates, we will generate it. and when we received a token, we will check it from our database and look for the corresponding user.
> 

## Opaque Token

We don’t need to add tests. 

so let’s start with token generaion part 

- First let’s create a token based using NodeJS module crypto :
    
    ```tsx
    import crypto from 'crypto';
    
    export function randomString(length: number) {
      return crypto.randomBytes(length).toString('hex').substring(0, length);
    }
    ```
    
- Then we remove the function `generateToken` in the `user.helper.model.ts` . then let’s change the implementation for with the function above.
- Now let’s create a model for this :
    - create a folder `auth` under the `models` folder. then within it let’s create `Auth.model.ts`
    - also create a helper for this `Auth.helper.model.ts`
- Now in the `Auth.model.ts` :
    - 
    
    ```tsx
    import {
      Model,
      InferAttributes,
      InferCreationAttributes,
      CreationOptional,
      DataTypes
    } from 'sequelize';
    
    import { sequelize } from '../../config/database';
    
    export class Auth extends Model<
      InferAttributes<Auth>,
      InferCreationAttributes<Auth>
    > {
      declare id: CreationOptional<number>;
      declare token: string;
      declare userID: number;
      declare createdAt: CreationOptional<Date>;
      declare updatedAt: CreationOptional<Date>;
    }
    
    Auth.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        token: {
          type: DataTypes.STRING,
          unique: true,
        },
        userID: {
          type: DataTypes.INTEGER,
          unique: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'auth',
      }
    );
    ```
    
- Now in the helper function :
    - We create a token, and then after we create the token we save it in the database.
    - 
    
    ```tsx
    import crypto from 'crypto';
    import { Auth } from './Auth.model';
    
    export class AuthHelperModel {
      public static randomString(length: number) {
        return crypto.randomBytes(length).toString('hex').substring(0, length);
      }
    
      public static async createOpaqueToken(id: number) {
        const token = AuthHelperModel.randomString(32);
        await Auth.create({
          token,
          userID: id,
        });
    
        return token;
    
      }
    }
    ```
    
- Now let’s create the token verification :
    
    ```tsx
    import crypto from 'crypto';
    import { Auth } from './Auth.model';
    
    export class AuthHelperModel {
      public static randomString(length: number) {
        return crypto.randomBytes(length).toString('hex').substring(0, length);
      }
    
      public static async createOpaqueToken(id: number) {
        const token = AuthHelperModel.randomString(32);
        await Auth.create({
          token,
          userID: id,
        });
    
        return token;
      }
    
      public static async verifyOpaqueToken(token: string) {
        const tokenInDB = await Auth.findOne({where: {token: token}});
        const userID = tokenInDB?.userID;
    
        return {id: userID};
      }
    }
    ```
    
- Now let’s replace `createJWTToken.ts` with `createOpaqueToken` and then `verifyJWTToken.ts` with `verifyOpaqueToken` .

Now all is set. 

Now, since we don’t need `JWT` dependencies we can remove it. 

However, since this is also my code snippet. I’m still preserving it, for the example in the future. 

> However, we haven’t set how many token that a user can have.
> 

In this case, so everytime we authenticate, then server will generate a new token for the user. Since They are not unique. So one user can have many tokens. 

## Logout

First, let’s create a test, when an unauthorized user send a request for log out, then it returns `200` : 

```tsx
test.only('returns 200 ok when unauthorized request send for logout', async() => {
    const response = await postLogout();
    expect(response.status).toBe(200);
  });
```

and here’s the `postLogout` function : 

```tsx
async function postLogout(options: postLogoutOption = {}) {
  const agent = request(app).post('/api/1.0/logout');
  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }
  return await agent.send();
}
```

So this is basically to test the new end point. the new point is `/api/1.0/logout` 

Ok, now the problem is the endpoint of `AuthController` is `'/api/1.0/auth'` 

So therefore, let’s create a new class for a new endponit. 

```tsx
@routerConfig('/api/1.0/auth')
class AuthController {
  @post('/', AuthHelperController.httpPostAuth as RequestHandler)
  @use(authLocal)
  @use(bodyValidatorMW(loginSchema, validationErrorGenerator, validationOption))
  authPost(): void {}

  @get('/localFailure', AuthHelperController.localAuthFailure)
  localFailure(): void {}
}

@routerConfig('/api/1.0/logout')
class AuthLogout {
  @post('/', AuthHelperController.httpLogout)
  logout(): void {}
}
```

Then creates a send back request in order to send `200` status Ok. 

Ok now let’s move to the next test. 

```tsx
test('removes the token from database', async () => {
    await UserHelperModel.addMultipleNewUsers(1);
    const response = await postAuthenticationUser1();
    const token = response.body.token;
    await postLogout({token});
    const storedToken = await Auth.findOne({where: {token: token}});
    expect(storedToken).toBeNull();
  });
```

In this test, we will send post request to the new logout end point, and would like to remove token from the database. This is quite tricky . 

Here’s the implementation in the helper controller: 

- FIRST WE CHECK THE authorization in the header.
- If exists then wse will delete the token from the database.

```tsx
public static async httpLogout(
    req: Request,
    res: Response
  ): Promise<void> {
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.substring(7);
      await AuthHelperModel.deleteOpaqueToken(token);
    }
    res.send();
  }
```

And here’s teh function in the `AuthHelperModel` : 

```tsx
public static async deleteOpaqueToken(token: string){
    await Auth.destroy({where: {token}});
  }
```

So basically we remove the line of the entry which has the token. 

Ok now everything is passed 

## Delete User

So for user delete, 

it’s quite similar with the user update,

First let’s create a new test called `UserDelete.test.ts` then copy all the code from `UserUpdate.test.ts` 

But let’s also copy the functin that handling authentication from `UserListing.test.ts` 

```tsx
interface optionAuth {
  auth?: {
    email: string,
    password: string,
  },
  token?: string,
}

async function auth(options: optionAuth){
  let token: string | undefined = undefined;

  if (options.auth) {
    const response = await request(app).post('/api/1.0/auth').send(options.auth);
    token = response.body.token;
  }

  return token;
}
```

then change the `deleteUser` function to be like this : 

```tsx
async function deleteUser(
  id = 5, 
  options: optionPostUser = {}
){
  
  const agent = request(app).delete(`/api/1.0/users/${id}`);
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }

  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }

  return await agent.send();
}
```

and let’s start with the first test to check the end point: 

```tsx
test('returns forbidden when request sent unauthorized', async() => {
    const response = await deleteUser();
    expect(response.status).toBe(403);
  });
```

Absolutely the test failed, since there’s no handler. 

Now let’s define the handler. 

the implementation is quite easy : 

- Add a new end point (or route)
    - Don’t forget to import `del` function first
- Then just send `403` response.

```tsx
@del('/:id', UserHelperController.httpDeleteUserById)
  userDeleteById(): void{}
```

Ok, and the rest will follow exactly like update. Since it’s too long. I don’t put all, but here’s the implementation of the controller `httpDeleteUserById` 

```tsx
public static async httpDeleteUserById(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authenticatedUser = req.authenticatedUser;
      const id = Number(req.params.id);

      if (!authenticatedUser || authenticatedUser.id !== id ) {
        throw new ErrorAuthForbidden(Locales.unauthorizedUserDelete);
      }

      await UserHelperModel.deleteUserByID(id);

      res.send();
    }

    catch(err) {
      next(err);
    }
  }
```

and for set up the routes like this : 

```tsx
@del('/:id', UserHelperController.httpDeleteUserById)
  @use(tokenAuthenticationMW)
  userDeleteById(): void{}
```

I also use the middleware for the token authentication id order to add properties to the req. 

## Token User Relationshiop

- If the user is deleted the token should be deleted right? Now let’s create a test for it
    - This test will check whether the token is deleted after the user is deleted
    
    ```tsx
    test('deletes token from the database when delete user request sent from authorized user', async() => {
        const userList = await UserHelperModel.addMultipleNewUsers(1);
        const token = await auth({
          auth: { 
            email : emailUser1, 
            password: passwordUser1,
          }});
    
        await deleteUser(
          userList[0].id, 
          {token}
        );
    
        if (typeof token !== 'string'){
          throw new Error('The user is not authorized');
        }
    
        const tokenInDM = await AuthHelperModel.findOpaqueToken(token);
        
        expect(tokenInDM).toBeNull();
      });
    ```
    
- the test will fail, now how to solve it :
    - First in the middleware - tokenAuthenticationMW we have to include the token within the req.
        - 
        
        ```tsx
        export async function tokenAuthenticationMW(
          req: RequestWithAuthenticatedUser,
          res: Response,
          next: NextFunction
        ): Promise<void> {
        
          const authorization = req.headers.authorization;
          
          if (authorization) {
            const token = authorization.substring(7);
            try {
              const user = await AuthHelperModel.verifyOpaqueToken(token);
              if (user) {
                req.authenticatedUser = user;
                req.token = token;
              }
            // eslint-disable-next-line no-empty
            } catch (error) {
            }
          }
        
          next();
        }
        ```
        
    - Then we have to create the deleteOpaqueToken in the `Auth` model. right?
        - 
        
        ```tsx
        public static async deleteOpaqueToken(token: string){
            await Auth.destroy({where: {token}});
          }
        ```
        
    - After that in the controller, we call the function to delete the token :
        - There’s a type check there to ensure the token exists and also the type is string. So I put it in the beginning to ensure that all is correct (type guard) before I implement it. Typescript will help a lot.
        
        ```tsx
        public static async httpDeleteUserById(
            req: RequestWithAuthenticatedUser,
            res: Response,
            next: NextFunction
          ): Promise<void> {
            try {
              const authenticatedUser = req.authenticatedUser;
              const token = req.token;
              const id = Number(req.params.id);
        
              if (!authenticatedUser || !token || typeof token !== 'string' || authenticatedUser.id !== id ) {
                throw new ErrorAuthForbidden(Locales.unauthorizedUserDelete);
              }
        
              await UserHelperModel.deleteUserByID(id);
        
              await AuthHelperModel.deleteOpaqueToken(token);
        
              res.send();
            }
        
            catch(err) {
              next(err);
            }
          }
        ```
        
- Now let’s test like this . The user can have mutiple token right? for example if the user login for several client, from phone, different browser, etc. If the user is deleted, all the token should be deleted. Remember: we can solve this directly on database level by setting proper relationship between User and Token tables.  So wheneven a user enter is removed, corresponing token entries would be automatically removed from the database.
    - Here’s the test :
        
        ```tsx
        test('deletes all tokens from the database when delete user request sent from authorized user', async() => {
            const userList = await UserHelperModel.addMultipleNewUsers(1);
            
            const token1 = await auth({
              auth: { 
                email : emailUser1, 
                password: passwordUser1,
              }});
        
            const token2 = await auth({
              auth: { 
                email : emailUser1, 
                password: passwordUser1,
              }});
              
            await deleteUser(
              userList[0].id, 
              {token: token1}
            );
        
            if (typeof token1 !== 'string' || typeof token2 !== 'string'){
              throw new Error('The user is not authorized');
            }
            
            const token1InDM = await AuthHelperModel.findOpaqueToken(token1);
            const token2InDM = await AuthHelperModel.findOpaqueToken(token2);
            
            expect(token1InDM).toBeNull();
            expect(token2InDM).toBeNull();
          });
        ```
        
    - So the solution is first, let’s remove all the implementation before, the test before this test where we delete the token entry in the `Auth` table. Then we connect the database. Here’s the database schema:
        - `User`
            - We import the Auth table and then use using `.hasMany` function
            
            ```tsx
            import {
              Model,
              InferAttributes,
              InferCreationAttributes,
              CreationOptional,
              DataTypes
            } from 'sequelize';
            
            import { sequelize } from '../../config/database';
            
            import { Auth } from '../auth';
            
            export class User extends Model<
              InferAttributes<User>,
              InferCreationAttributes<User>
            > {
              declare id: CreationOptional<number>;
              declare username: string;
              declare email: string;
              declare password: string;
              declare inactive: CreationOptional<boolean>;
              declare activationToken: CreationOptional<string>;
              declare createdAt: CreationOptional<Date>;
              declare updatedAt: CreationOptional<Date>;
            }
            
            User.init(
              {
                id: {
                  type: DataTypes.INTEGER,
                  autoIncrement: true,
                  primaryKey: true,
                },
                username: {
                  type: DataTypes.STRING,
                  unique: true,
                },
                email: {
                  type: DataTypes.STRING,
                  unique: true,
                },
                password: DataTypes.STRING,
                inactive: {
                  type: DataTypes.BOOLEAN,
                  defaultValue: true,
                },
                activationToken: DataTypes.STRING,
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE,
              },
              {
                sequelize,
                modelName: 'user',
              }
            );
            
            User.hasMany(Auth, {
              onDelete: 'cascade',
              foreignKey: 'userID',
            });
            ```
            
        - `Auth` , we make some changes here, by changing the `userID` property to be the foreign key :
            - As you can see here, we only change the type of the `userID` to be  `ForeignKey<number>;`
            
            ```tsx
            import {
              Model,
              InferAttributes,
              InferCreationAttributes,
              CreationOptional,
              DataTypes,
              ForeignKey
            } from 'sequelize';
            
            import { sequelize } from '../../config/database';
            
            export class Auth extends Model<
              InferAttributes<Auth>,
              InferCreationAttributes<Auth>
            > {
              declare id: CreationOptional<number>;
              declare token: string;
              declare userID: ForeignKey<number>;
              declare createdAt: CreationOptional<Date>;
              declare updatedAt: CreationOptional<Date>;
            }
            
            Auth.init(
              {
                id: {
                  type: DataTypes.INTEGER,
                  autoIncrement: true,
                  primaryKey: true,
                },
                token: {
                  type: DataTypes.STRING,
                },
                userID: {
                  type: DataTypes.INTEGER,
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE,
              },
              {
                sequelize,
                modelName: 'auth',
              }
            );
            ```
            

> Some problem here. In the tutorial in the test , we have to drop the database like this : `await User.destroy({truncate: {cascade: true}})` However this can’t be implemented in Typescript. The tutor mentioned that this could be a problem if we use this in the postgres. Therefore let’s try to set this up using postgress. I think both test, development, and production have to use the same database. Maybe we can set up different database for each.
> 

## Expiring Token

Now let’s talk about expiring token. The token is still there, except that the user logout or the user is deleted. Now let’s add the functionality to make the token expired. 

> In Sequalize we can delete the `createdAt`  and `updatedAt` by using this properties: `timestamps: false` .
> 

But let’s use it. since I think it’s good though.  

- First step is to add the field in the database table `Auth` by like this :
    - We’re adding the lastUsedAt, and it’s a creationOptional.
    
    ```tsx
    export class Auth extends Model<
      InferAttributes<Auth>,
      InferCreationAttributes<Auth>
    > {
      declare id: CreationOptional<number>;
      declare token: string;
      declare userID: ForeignKey<number>;
      declare lastUsedAt: CreationOptional<Date>; 
      declare createdAt: CreationOptional<Date>;
      declare updatedAt: CreationOptional<Date>;
    }
    
    Auth.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        token: {
          type: DataTypes.STRING,
        },
        userID: {
          type: DataTypes.INTEGER,
        },
        lastUsedAt: {
          type: DataTypes.DATE,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'auth',
      }
    );
    ```
    
- Now let’s create a test: I will not go down step by step, but here’s all the new test:
    - 
    
    ```tsx
    describe('Token Expiration', () => {
      test('returns 403 when token is older than 1 week', async () => {
        const savedUser = await UserHelperModel.addMultipleNewUsers(1);
    
        const token = 'test-token';
        const oneWeekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000) - 1);
    
        await Auth.create({
          token: token,
          userID:  savedUser[0].id,
          lastUsedAt: oneWeekAgo,
        });
    
        const response = await putUser(savedUser[0].id, validUpdate, {token});
    
        expect(response.status).toBe(403); 
    
      });
      test('refreshes lastUsedAt when unexpired token is used', async () => {
        const savedUser = await UserHelperModel.addMultipleNewUsers(1);
    
        const token = 'test-token';
        const fourDaysAgo = new Date(Date.now() - (4 * 24 * 60 * 60 * 1000) );
    
        await Auth.create({
          token: token,
          userID:  savedUser[0].id,
          lastUsedAt: fourDaysAgo,
        });
    
        const rightBeforeSendingRequest = new Date().getTime();
    
        await putUser(savedUser[0].id, validUpdate, {token});
    
        const tokenInDB = await AuthHelperModel.findOpaqueToken(token);
        expect(tokenInDB?.lastUsedAt.getTime()).toBeGreaterThan(rightBeforeSendingRequest);
    
      });
      test('refreshes lastUsedAt when unexpired token is used for unauthenticated end point', async () => {
        const savedUser = await UserHelperModel.addMultipleNewUsers(1);
    
        const token = 'test-token';
        const fourDaysAgo = new Date(Date.now() - (4 * 24 * 60 * 60 * 1000) );
    
        await Auth.create({
          token: token,
          userID:  savedUser[0].id,
          lastUsedAt: fourDaysAgo,
        });
    
        const rightBeforeSendingRequest = new Date().getTime();
    
        await request(app).get('/api/1.0/users/5').set('Authorization', `Bearer ${token}`);
    
        const tokenInDB = await AuthHelperModel.findOpaqueToken(token);
        expect(tokenInDB?.lastUsedAt.getTime()).toBeGreaterThan(rightBeforeSendingRequest);
    
      });
    });
    ```
    
- The implementation?
    - First of all , when we create the opaque token, now we also inject the new date for it :
        
        ```tsx
        public static async createOpaqueToken(id: number) {
            const token = AuthHelperModel.randomString(32);
            await Auth.create({
              token,
              userID: id,
              lastUsedAt: new Date(),
            });
            
            return token;
          }
        ```
        
    - Second, everytime we verify Opaquetoken, we update it too also :
        
        ```tsx
        public static async verifyOpaqueToken(token: string) {
            const maxAge = this.maxAgeTokenByDay(7);
        
            const tokenInDB = await Auth.findOne({
              where: {
                token: token,
                lastUsedAt: {
                  [Op.gt]: maxAge,
                },
              }});
        
            if (tokenInDB) {
              await tokenInDB.update({
                lastUsedAt: new Date(),
              });
              await tokenInDB.save();
            }
        
            const userID = tokenInDB?.userID;
        
            return {id: userID};
          }
        ```
        
    - The last one. This is quite crucial. We move the middleware `tokenAuthenticationMW` to the `app.ts` , so every time it will check for the token, and set the `req` to have `req.authenticatedUser` everytime it has the proper token. It’s quite smart right.
    - asdf
    - adf
    - 
- 

## Token CleanUp

We will have a function to clean up the expired token. So every one hour, the application with clean up the expired token : 

Let’s create a test for it: 

```tsx
import { sequelize } from '../config/database';
import { Auth, User } from '../models';
import { 
  AuthHelperModel,
  UserHelperModel
} from '../models';

beforeAll( async () => {
  await sequelize.sync();
});

beforeEach( async() => {
  await User.destroy({truncate: true});
  await Auth.destroy({truncate: true});
});

describe('Scheduled Token Clean Up', () => {
  test('clears the expired token with scheduled task', async () => {
    jest.useFakeTimers();
    const savedUser = await UserHelperModel.addMultipleNewUsers(1);
    const token = 'test-token';
    const eightDaysAgo = AuthHelperModel.maxAgeTokenByDay(8);
    await Auth.create({
      token,
      userID: savedUser[0].id,
      lastUsedAt: eightDaysAgo,
    });

    AuthHelperModel.scheduleCleanUp();

    jest.advanceTimersByTime((60*60*1000) + 5000 );
    const tokenInDB = await Auth.findOne({
      where: {token: token},
    });

    expect(tokenInDB).toBeNull();

  });
});
```

Great now let’s write the implementation: 

```tsx
public static scheduleCleanUp() {
    setInterval(async ()=> {
      const oneWeekAgo = this.maxAgeTokenByDay(7);
      await Auth.destroy({
        where: {lastUsedAt: {
          [Op.lt]: oneWeekAgo,
        }},
      });
    }, 60 * 60 * 1000);
  }
```

Please note for the test above: 

- It’s using `jest.useFakeTimers()`
- After we call the function then we advance the time using `jest.advanceTimersByTime((60 * *60 ** 1000) + 5000 );`
- that means we advance the time to be an hour.

After that we need to change the `index.ts` 

```tsx
import { app } from './app';
import { sequelize } from './config/database';
import { UserHelperModel, AuthHelperModel } from './models';

const PORT = 3000;

sequelize.sync({force: true}).then(async () => {
  await UserHelperModel.addMultipleNewUsers(25);
});

AuthHelperModel.scheduleCleanUp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening to port ... ${PORT}`);
});
```

The code above means that we’re running the clean up every one hour. If we’d like to test whether it’s running or not, we can change the interval to be 1 second. and use console.log. 

Should we use this feature? Every hour to clean up the token? Why not? 

# Account Recovery

## Password Reset Request

Here’s the test :

So basically the test below tests for handling the error: and also for example the user is not exist. 

```tsx
test('returns 404 when a password reset request is sent for unknown email',  async () => {
    const response = await postResetPassword();

    expect(response.status).toBe(404);
  });

  test.each`
  language    | message
  ${'en'}     | ${en.emailNotInuse}
  ${'id'}     | ${id.emailNotInuse}
  `('return error body with "$message" for unknown email when language is "$language"', 
  async({language, message}) => {
    const nowInMilis = new Date().getTime();
    const response = await postResetPassword(emailUser1, language);

    expect(response.body.path).toBe(API_URL_RESET_PASSWORD);
    expect(response.body.timeStamp).toBeGreaterThan(nowInMilis);
    expect(response.body.message).toBe(message);
  });

  test.each`
  language   | email         | message
  ${'en'}    | ${''}         | ${en.errorEmailEmpty}
  ${'id'}    | ${''}         | ${id.errorEmailEmpty}
  ${'en'}    | ${'aguan@'}   | ${en.errorEmailInvalid}
  ${'id'}    | ${'aguan@'}   | ${id.errorEmailInvalid}
  `('return 400 with validation Error "$message" when email is "$email" and language is "$language"', 
  async({language, email, message}) => {
    const response = await postResetPassword(email, language);

    expect(response.body.validationErrors.email).toBe(message);
    expect(response.status).toBe(400);
  });
```

The implementation is : 

- Create a new end point :
    
    ```tsx
    @routerConfig('/api/1.0/password-reset')
    class PasswordReset {
      @post('/', AuthHelperController.httpPostPasswordReset)
      @use(bodyValidatorMW(passwordResetSchema, validationErrorGenerator, validationOption))
      resetPassword(): void {}
    }
    ```
    
- Create a new schema for validation, in this case `passwordResetSchema`. and for the body validation is quite similar with handling other form validation.
- Then we create an error Class:
    
    ```tsx
    export class ErrorEmailNotInuse extends Error {
      public code = 404;
      constructor(message = Locales.emailNotInuse) {
        super(message);
      }
    }
    ```
    
- then add the error handling to the the `ErrorHandle` function:
    
    I refactored it so I don’t have to pass or operator, everytime I add a new simple error.  So just pass in the error name. 
    
    ```tsx
    // Begin: handling ErrorGroup simple
      let isErrorGroupSimpleFound = false;
      const ErrorGroupSimple = [
        ErrorSendEmailActivation,
        ErrorToken,
        ErrorUserNotFound,
        ErrorAuthFailed,
        ErrorAuthForbidden,
        ErrorEmailNotInuse,
      ];
      ErrorGroupSimple.some((errorClass) => {
        if (err instanceof errorClass) {
          isErrorGroupSimpleFound = true;
          res.status(err.code).send(generateResponse(path, req.t(err.message)));
          return true;
        }
      });
      if(isErrorGroupSimpleFound) {
        return;
      }
       // end: handling ErrorGroup simple
    ```
    

## Password Reset Success Response

Now let’s set the test where it’s succesful, I mean the email is registered: 

- First test about to send 200 ok when the email is registered
    
    ```tsx
    test('returns 200 ok when a password reset request is sent for known email', async () => {
        const user = await UserHelperModel.addMultipleNewUsers(1);
        const response = await postResetPassword(user[0].email);
        expect(response.status).toBe(200);
      });
    ```
    
- The second test is to check the success message in the body of the response
    
    ```tsx
    test.each`
      language    | message
      ${'en'}     | ${en.passwordResetRequestSuccess}
      ${'id'}     | ${id.passwordResetRequestSuccess}
      `('returns success response body with the message "$message" for known email when language is "$language"',
      async({language, message}) => {
        const user = await UserHelperModel.addMultipleNewUsers(1);
        const response = await postResetPassword(user[0].email, language);
    
        expect(response.body.message).toBe(message);
      });
    ```
    
- And the last test is to check whether in the database the user has a new property: `passwordResetToken`
    
    ```tsx
    test('creates passwordResetToken when a password reset request is senf from known email', async () => {
        const user = await UserHelperModel.addMultipleNewUsers(1);
        await postResetPassword(user[0].email);
        const userInDB = await User.findOne({
          where: {
            email: user[0].email,
          },
        });
    
        expect(userInDB?.passwordResetToken).toBeTruthy();
    
      });
    ```
    

Ok now how’s the implementation? 

- As you can see here. First we check using the existing function to find whether the user is existed or not. Then we thrown an error if it’s not found.
- After that we added translation for both languages and also create a new line of ENUM for the translation code.
    - Then we create a new function in the `userHelperModel` : We pass in the user instance in the function and then create a new properties, in this case we field in the property `passwordResetToken` for the user in the database.

```tsx
public static async createPasswordResetToken(user: User) {
    user.passwordResetToken = AuthHelperModel.randomString(16);
    await user.save();
  }
```

```tsx
public static async httpPostPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      const user = await UserHelperModel.findUserByEmail(email);

      if (!user) {
        throw new ErrorEmailNotInuse();
      }

      await UserHelperModel.createPasswordResetToken(user);

      const response: ResponsePasswordResetRequestSuccess = {
        message: req.t(Locales.passwordResetRequestSuccess),
      };

      res.send(response);
      
    } catch (err) {
      next(err);
    }
  }
```

## Sending Pasword Reset Email

now let’s create a new test. Before that let’s copy and paste several codes from `UserRegister.test` . For the sending email server: 

```tsx
import { SMTPServer } from 'smtp-server';

let lastMail: string;
let server: SMTPServer;
let simulateSmtpFailure = false;

class ErrorSimulate extends Error {
  public responseCode = 0;
  constructor(message: string) {
    super(message);
  }
}

beforeAll( async () => {
  await sequelize.sync();
  
  server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody = '';
      stream.on('data', (data) => {
        mailBody += data.toString();
      });
      stream.on('end', () => {
        if (simulateSmtpFailure) {
          const err = new ErrorSimulate('Invalid mailbox');
          err.responseCode = 533;
          return callback(err);
        }
        lastMail = mailBody;
        callback();
      });
    },
  });

  server.listen(8585, 'localhost');
});

beforeEach( async () => {
  simulateSmtpFailure = false;
  jest.restoreAllMocks();
  await User.destroy({truncate: true});
});

afterAll(async () => {
  await sequelize.close();
  server.close();
});
```

Now let’s create a test : 

```tsx
test('sends a password reset email wiht passwordResetToken', async () => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });

    const passwordResetToken = userInDB?.passwordResetToken;
    expect(lastMail).toContain(user[0].email);
    expect(lastMail).toContain(passwordResetToken);
  });
```

In this test, we’re creating a new user, then we send a password request. Then we’re expecting to get an email that contains the email, and also the `paswordResetToken` .

How’s the implementation? We go to the `email` folder and go to `EmailService.ts` . This is a function to send email.  Let’s create a new function : 

```tsx
export async function sendPasswordReset(user: User): Promise<void | Error> {
  const response = await transporter.sendMail({
    from: 'Joke Factory <hello@jokefactory>',
    to: user.email,
    subject: 'Password Reset',
    html: `
    <div>
      Please click link below to reset your password
    <div>
    <div>
      <a href="http://localhost:8080/#/password-reset?reset=${user.passwordResetToken}">Reset</a>
    <div>
      `,
  });

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(nodemailer.getTestMessageUrl(response));
  }
}
```

this functino will send email. 
now let’s go back to the `auth.helper.controller.ts` 

now let’s call the function to send the email :  `await sendPasswordReset(user);

```tsx
public static async httpPostPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      const user = await UserHelperModel.findUserByEmail(email);

      if (!user) {
        throw new ErrorEmailNotInuse();
      }

      await UserHelperModel.createPasswordResetToken(user);

      await sendPasswordReset(user);

      const response: ResponsePasswordResetRequestSuccess = {
        message: req.t(Locales.passwordResetRequestSuccess),
      };

      res.send(response);
      
    } catch (err) {
      next(err);
    }
  }
}
```

Now let’s add a new test: 

- This test will make the sending email is failed, and we are expecting the status code `502`
    
    ```tsx
    test('returns 502 Bad Gateway when sending email fails', async () => {
        simulateSmtpFailure = true;
        const user = await UserHelperModel.addMultipleNewUsers(1);
        const response = await postResetPassword(user[0].email);
        expect(response.statusCode).toBe(502);
      });
    ```
    
- It receives 400 instead of 502, why? off course, since in our functino to handle error, if we don’t know what the error is it sends 400 status error.
    - First let’s create the error class :  This is quite similar with `ErrorSendEmailActivation` . Let’s refactor it later, by changing the name to `ErrorSendEmail`  but later
        
        ```tsx
        export class ErrorSendEmailPasswordReset extends Error {
          public code = 502;
          constructor(message = Locales.emailFailure) {
            super(message);
          }
        }
        ```
        
    - Then as usual, we add this class error ro the `ErrorGroupSimple` in the `ErrorHandle.ts`
    - Then wrap the sending email function into a try catch block.
        
        ```tsx
        try {
              const { email } = req.body;
        
              const user = await UserHelperModel.findUserByEmail(email);
        
              if (!user) {
                throw new ErrorEmailNotInuse();
              }
        
              await UserHelperModel.createPasswordResetToken(user);
        
              try {
                await sendPasswordReset(user);
              } catch(err) {
                throw new ErrorSendEmailPasswordReset();
              }
        
              const response: ResponsePasswordResetRequestSuccess = {
                message: req.t(Locales.passwordResetRequestSuccess),
              };
        
              res.send(response);
              
            } catch (err) {
              next(err);
            }
        ```
        
    

Okay, now let’s test the internalization for it. 

here’s the test: 

```tsx
test.each`
  language    | message
  ${'en'}     | ${en.emailFailure}
  ${'id'}     | ${id.emailFailure}
  `('returns error body with the message "$message" when sending email is failed & language is "$language"',
  async({language, message}) => {
    simulateSmtpFailure = true;
    const user = await UserHelperModel.addMultipleNewUsers(1);
    const response = await postResetPassword(user[0].email, language);
    expect(response.body.message).toBe(message);
  });
```

<aside>
💡 Remember: 
Handling failure scenario is difficult than success scenario. Therefore we have expand the scenario if something fails.

</aside>

## Moving Endpoint to User

Before I created this in the Auth controller. After thinking for a while for the sake of consistency, I think I have to move it to the `user` end point. To move it it’s pretty simply, I just need to move the helper function and also the controller to the user controller 

## Updating-password / error Cases

Here’s the test for error cases : 

```tsx
describe('Password Update', () => {
  test('returns 403 when password update request does not have the valid token', async () => {
    const response = await putPasswordUpdate();
    expect(response.status).toBe(403);
  });

  test.each`
  language    | message
  ${'id'}     | ${id.unauthPasswordReset}
  ${'en'}     | ${en.unauthPasswordReset}
  `('returns error body with "$message" if the passwordResetToken invalid when language is "$language"',
  async({language, message}) => {
    const nowInMilis = new Date().getTime();
    const response = await putPasswordUpdate(
      {
        password: randomPassword,
        passwordResetToken: randomPasswordResetToken,
      },
      {
        language: language,
      }
    );

    expect(response.body.path).toBe(API_URL_UPDATE_PASSWORD);
    expect(response.body.timeStamp).toBeGreaterThan(nowInMilis);
    expect(response.body.message).toBe(message);
  });

  test('returns 403 when the password request is invalid and reset token is invalid', async () => {
    const response = await putPasswordUpdate(
      {
        password: 'as',
        passwordResetToken: 'as',
      });

      expect(response.status).toBe(403);
  });

  test('return 400 when trying to update with invalid password, and reset token is valid', async () => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });
    const token = userInDB?.passwordResetToken;

    if (!token) {
      throw new Error('Something wrong with the db');
    }

    const response = await putPasswordUpdate(
      {
        password: 'as',
        passwordResetToken: token,
      }
    );

    expect(response.status).toBe(400);
  });

  test.each`
    language    | value                     | errorMessage
    ${'en'}     | ${null}                   | ${en.errorPasswordNull}
    ${'en'}     | ${'password'}             | ${en.errorPassword1}
    ${'en'}     | ${'password@123'}         | ${en.errorPassword1}
    ${'en'}     | ${'823472734'}            | ${en.errorPassword1}
    ${'en'}     | ${'P4S5WORDS'}            | ${en.errorPassword1}
    ${'en'}     | ${'P1@a'}                 | ${en.errorPassword2}
    ${'en'}     | ${'%^&*('}                | ${en.errorPassword2}
    ${'id'}     | ${null}                   | ${id.errorPasswordNull}
    ${'id'}     | ${'password'}             | ${id.errorPassword1}
    ${'id'}     | ${'password@123'}         | ${id.errorPassword1}
    ${'id'}     | ${'823472734'}            | ${id.errorPassword1}
    ${'id'}     | ${'P4S5WORDS'}            | ${id.errorPassword1}
    ${'id'}     | ${'P1@a'}                 | ${id.errorPassword2}
    ${'id'}     | ${'%^&*('}                | ${id.errorPassword2}
  `('[password validationErrors] returns "$errorMessage" when "$value" is received when language is "$language"', 
  async({language, value, errorMessage}) => {
    const user = await UserHelperModel.addMultipleNewUsers(1);
    await postResetPassword(user[0].email);
    const userInDB = await User.findOne({
      where: {
        email: user[0].email,
      },
    });
    const token = userInDB?.passwordResetToken;

    if (!token) {
      throw new Error('Something wrong with the db');
    }

    const response = await putPasswordUpdate(
      {
        password: value,
        passwordResetToken: token,
      },
      {language: language}
    );

    if (language === 'en') {
      expect(response.body.message).toBe(en.validationFailure);
    }

    if (language === 'id') {
      expect(response.body.message).toBe(id.validationFailure);
    }

    expect(response.body.validationErrors['password']).toBe(errorMessage);

  });
});
```

How to pass it ? 

- Create a new end point that has two middlewares. the first one is to check the token, whether is valid or not, and the second one is for validate the password:
    
    ```tsx
    @routerConfig('/api/1.0/user')
    class UserController {
      @post('/password-reset', UserHelperController.httpPostPasswordReset)
      @use(bodyValidatorMW(passwordResetSchema, validationErrorGenerator, validationOption))
      resetPassword(): void {}
    
      @put('/password', UserHelperController.httpPutPasswordUpdate)
      @use(bodyValidatorMW(passwordUpdateSchema, validationErrorGenerator, validationOption))
      @use(passwordResetTokenCheckMW as RequestHandler)
      passwordUpdate(): void {}
    }
    ```
    
- so we create a new validation Schema for body validator, `passwordUpdateScema`/ So this is just to validate password and also `passwordResetToken`
    
    ```tsx
    export const passwordUpdateSchema = Joi.object({
      password: Joi.string()
        .min(8)
        .pattern(
          new RegExp(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
          )
        )
        .required()
        .messages({
          'string.base': Locales.errorPasswordNull,
          'string.pattern.base': Locales.errorPassword1,
          'string.empty': Locales.errorPasswordEmpty,
          'string.min': Locales.errorPassword2,
        }),
      passwordResetToken: Joi.string()
        .required(),
    }).options({
        allowUnknown: false,
    }).messages({
      'object.unknown': Locales.customFieldNotAllowed,
    });
    ```
    
- and here’s the middleware for the `passwordResetTokenCheckMW`
    
    ```tsx
    import { RequestWithUser} from '../../models';
    import { Response, NextFunction } from 'express';
    
    import { UserHelperModel } from '../../models';
    
    import { ErrorAuthForbidden } from '../Errors';
    
    import { Locales } from '../Enum';
    
    import { ErrorHandle } from '../Errors';
    
    export async function passwordResetTokenCheckMW(
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> {
    
      try {
        const token = req.body.passwordResetToken;
      
        const user = await UserHelperModel.findUserBypasswordResetToken(token);
        if (!user) {
          ErrorHandle(new ErrorAuthForbidden(Locales.unauthPasswordReset), req, res, next);
          return;
        }
    
        req.user = user;
    
      // eslint-disable-next-line no-empty
      } catch (err) {
      }
    
      next();
    }
    ```
    

The callback functino in the controller is not important now so we just send send 200 ok :

```tsx
public static async httpPutPasswordUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.send();
    } catch (err) {
      next(err);
    }
  }
```

## Updating Password - Success

- First test. We test if it sends `200` status Ok , when the password is valid and token is also valid :
    - here’s the test: This will pass since we already set it up
        
        ```tsx
        test('returns 200 Ok when valid password is send with valid reset token ', async () => {
            const user = await UserHelperModel.addMultipleNewUsers(1);
            await postResetPassword(user[0].email);
            const userInDB = await User.findOne({
              where: {
                email: user[0].email,
              },
            });
            const token = userInDB?.passwordResetToken;
        
            if (!token) {
              throw new Error('Something wrong with the db');
            }
        
            const response = await putPasswordUpdate(
              {
                password: randomPassword,
                passwordResetToken: token,
              }
            );
        
            expect(response.status).toBe(200);
          });
        ```
        
- Check if the password is updated:
    - test
        
        Anyway I have refactored the test, so we don’t have to repeat here’s the function `createUserPostResetPutPassword` : 
        
        ```tsx
        async function createUserPostResetPutPassword(
          password = randomPassword,
          language = 'en'
        ) {
            const user = await UserHelperModel.addMultipleNewUsers(1);
            await postResetPassword(user[0].email);
            const userInDB = await User.findOne({
              where: {
                email: user[0].email,
              },
            });
            const token = userInDB?.passwordResetToken;
        
            if (!token) {
              throw new Error('Something wrong with the db');
            }
        
            return await putPasswordUpdate(
              {
                password,
                passwordResetToken: token,
              },
              {
                language,
              }
            );
        }
        ```
        
        ```tsx
        test('updates the password in database when valid password is send with valid reset token ', async () => {
            await createUserPostResetPutPassword();
        
            const userUpdateInDM = await User.findOne({
              where: {
                email: emailUser1,
              },
            });
        
            expect(userUpdateInDM?.password).not.toEqual(emailUser1);
          });
        ```
        
    - Great. now let’s check the implementation :
        
        Here’s the implementation in the `httpPutPasswordUpdate` ,. : 
        
        ```tsx
        public static async httpPutPasswordUpdate(
            req: RequestWithUser,
            res: Response,
            next: NextFunction
          ): Promise<void> {
            try {
              const user = req.user;
        
              if (!user) {
                throw new Error('something wrong with the "passwordResetTokenCheckMW"');
              }
        
              const newPassword = req.body.password;
        
              await UserHelperModel.updatePassword(user, newPassword );
        
              res.send();
        
            } catch (err) {
              next(err);
            }
          }
        ```
        
        and here’s the helper function to update the password : 
        
        ```tsx
        public static async updatePassword(user: User, newPassword: string) {
            const newHashPassword = await this.hashPassword(newPassword);
            user.password = newHashPassword;
            await user.save();
          }
        ```
        
- Now, the problem is , if this token is compromised then anyone can update the password. So we have to clear this token from the table after it’s done.
    - test :
        
        ```tsx
        test('clears the reset token in database when the request is valid ', async () => {
            await createUserPostResetPutPassword();
        
            const userUpdateInDM = await User.findOne({
              where: {
                email: emailUser1,
              },
            });
        
            expect(userUpdateInDM?.passwordResetToken).toBeFalsy();
          });
        ```
        
    - Implementation:
        
        Just update our helper function like below : 
        
        ```tsx
        public static async updatePassword(user: User, newPassword: string) {
            const newHashPassword = await this.hashPassword(newPassword);
            user.password = newHashPassword;
            user.passwordResetToken = '';
            await user.save();
          }
        ```
        
    
- So we not only want them to reset the password, but also to recover from inactive account. So have also have to ensure that the accoutn is active and the ActivationToken is also begone. let’s create a test
    - Test
        
        However, before we do this test, let’s make a little bit tweak for the function `createuserPostResetPutPassword` : So, just to add activation token. 
        
        ```tsx
        async function createUserPostResetPutPassword(
          password = randomPassword,
          language = 'en'
        ) {
            const user = await UserHelperModel.addMultipleNewUsers(0, 1);
            await postResetPassword(user[0].email);
            const userInDB = await User.findOne({
              where: {
                email: user[0].email,
              },
            });
        
            if (!userInDB) {
              throw new Error('Something error with DB');
            }
            userInDB.activationToken = 'random';
            await userInDB.save();
        
            const token = userInDB?.passwordResetToken;
        
            if (!token) {
              throw new Error('Something wrong with the db');
            }
        
            return await putPasswordUpdate(
              {
                password,
                passwordResetToken: token,
              },
              {
                language,
              }
            );
        }  
        ```
        
        ```tsx
        test('activates and clears activation Token if the account is inactive after valid password reset', async () => {
            await createUserPostResetPutPassword();
        
            const userUpdateInDM = await User.findOne({
              where: {
                email: emailUser1,
              },
            });
        
            expect(userUpdateInDM?.inactive).toBe(false);
            expect(userUpdateInDM?.activationToken).toBeFalsy();
          });
        ```
        
    - Implementation:
- The user might login multiple clients, after password changed, we must invalidating token, therefore we reinforcing the client to re log in.
    - Test
        
        This test is quite long, since I don’t refactor it, I extract the previous function : 
        
        ```tsx
        test('It clears all tokens of User, when password has changed', async () => {
            // I don't refactor this since I only use it once. 
            const user = await UserHelperModel.addMultipleNewUsers(0, 1);
            await postResetPassword(user[0].email);
            const userInDB = await User.findOne({
              where: {
                email: user[0].email,
              },
            });
        
            if (!userInDB) {
              throw new Error('Something error with DB');
            }
            userInDB.activationToken = 'random';
            await userInDB.save();
        
            await Auth.create({
              userID: userInDB.id,
              token: 'randomtoken',
              lastUsedAt: new Date(Date.now()),
            });
        
            const token = userInDB?.passwordResetToken;
        
            if (!token) {
              throw new Error('Something wrong with the db');
            }
        
            await putPasswordUpdate(
              {
                password: randomPassword,
                passwordResetToken: token,
              }
            );
        
            const tokens = await Auth.findAll({
              where: {
                userID: userInDB.id,
              },
            });
        
            expect(tokens.length).toBe(0);
          
          });
        ```
        
    - Implementation :
        - First of All, I created a new helper function for the `Auth.helper.model.ts` :
            
            ```tsx
            public static async destroyAllTokensByUserId(id: number) {
                await Auth.destroy({
                  where: {
                    userID: id,
                  },
                });
              }
            ```
            
        - After that I called the function in the `user.helper.model.ts` :
            
            ```tsx
            public static async updatePassword(user: User, newPassword: string) {
                const newHashPassword = await this.hashPassword(newPassword);
                user.set({
                  password: newHashPassword,
                  passwordResetToken: '',
                  inactive: false,
                  activationToken: '',
                });
            
                await user.save();
            
                await AuthHelperModel.destroyAllTokensByUserId(user.id);
              }
            ```
            
        
- 

# User Update part 2

## User Profile Image

- Now let’s begin the test. Now let’s go back to the `UserUpdate.test.ts` add this line of test. So, in this test we will be sending the our locale tile to thhe backend .  Please be note, that the test below will shows a typescript error, since we don’t have any image properties in the database module.
    
    ```tsx
    import fs from 'fs';
    import path from 'path';
    
    // the previous code ...
    
    test('saves the user image when update contains image as base64', async () => {
        const filePath = path.join('.', '__tests__', 'resources', 'test-png.png');
        const fileInBase64 = fs.readFileSync(filePath, {encoding: 'base64'});
    
        const userList = await UserHelperModel.addMultipleNewUsers(1, 0);
    
        const validUpdate = { 
          username: 'user1-updated',
          image: fileInBase64,
        };
    
        await putUser(
          userList[0].id, 
          validUpdate, 
          {auth : { 
            email : emailUser1, 
            password: passwordUser1,
          }}
        );
    
        const updatedUser = await UserHelperModel.getActiveUserByid(userList[0].id);
        expect(updatedUser?.image).toBeTruthy();
      });
    ```
    
- Implementation
    - First of all, let’s change the `User Model` schema first. Let’s add it :  ( I just adding the additional code for it )
        
        ```tsx
        declare image: CreationOptional<string>;
        
        // In the `User.init` 
        
        image: DataTypes.STRING,
        ```
        
    - Second now let’s go to the controller, and this time we have to add something to the body validation first. We’d like to add a new field `image` however this is just optional only :  By doing this way, we won’t allow any unknown field.
        
        ```tsx
        export const userUpdateSchema = Joi.object({
          username: Joi.string()
            .required()
            .messages({
              'any.required': Locales.errorUsernameEmpty,
              'string.empty': Locales.errorUsernameEmpty,
              'string.base': Locales.errorUsernameNull,
            }),
          image: Joi.any().optional(),
        }).options({
            allowUnknown: false,
        }).messages({
          'object.unknown': Locales.customFieldNotAllowed,
        });
        ```
        
    - The third, is to update the function both in the controller helper an also in the model helper
        
        In the controller helper  
        
        =⇒ I’m changing the whole structure now, by changing the data type for any in the request body. Eventhough I have already validated it in the middleware but it’s only for the user name, I haven’t validated anything for the image. 
        
        ```tsx
        public static async httpPutUserById(
            req: RequestWithAuthenticatedUser,
            res: Response,
            next: NextFunction
          ): Promise<void> {
            try {
              const authenticatedUser = req.authenticatedUser;
              const requestBody: unknown = req.body;
              const id = Number(req.params.id);
        
              if ( !authenticatedUser || authenticatedUser.id !== id) {
                throw new ErrorAuthForbidden(Locales.unauthorizedUserUpdate);
              }
        
              if (typeof requestBody !== 'object' || requestBody === null) {
                throw new Error('Something wrong with the req.body, please check the middleware');
              }
        
              const expectedRequestBody = requestBody as ExpectedRequestBodyhttpPutUserById;
        
              await UserHelperModel.updateUserByID(id, expectedRequestBody );
              res.send();
            }
        
            catch(err) {
              next(err);
            }
          }
        
        ```
        
        Now in the model helper 
        
        ⇒ Basically this is quite the same with previously, the only difference is for the checking whether the image properties exist or not, if yes, then I’ll assign value to it. 
        
        ```tsx
        public static async updateUserByID(idParams: number, body: ExpectedRequestBodyhttpPutUserById): Promise<void> {
            const user = await this.getActiveUserByid(idParams);
        
            if (!user) {
              throw new ErrorUserNotFound();
            }
        
            if (body.image) {
              user.image = body.image;
            }
        
            user.username = body.username;
        
            await user.save();
          }
        ```
        

## Image in Responses

## H2

## H2

## H2

# H1

# H1
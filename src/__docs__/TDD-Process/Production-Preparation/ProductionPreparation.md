# Production Preparation

## About Migration - Migration Demo

When you're using Linux or WSL, before using any SQLite viewer, you have to install `sqlite3` first: 
```
sudo apt install sqlite3)
```

Now let's do something like this : 

- In our `index.ts` we have this line of code :

  ```
  sequelize.sync({force: true}).then(async () => {
    await UserHelperModel.addMultipleNewUsers(25);
  });
  ```

  `{force: true}` will wipe out the entire database and create a new table from scratch. 

  Next, also remove the `database.sqlite`. Then run our app.

  To see the database, let's use this: [DB Browser for SQLite](https://sqlitebrowser.org/)

  Now let's change the schema of the user database and run in again. As you can see that when the new field is not updated into our database. 
  However if we use {force: true} then the new field will be there. The reason is that using {force: true} will drop the previous database and create a new one. 


The question is that we're constantly change our database schema, in the test and development environment before, we wipe up the entire database and create a new one. The question is how we manage the database in the production? 

- We're going to use this [sequelize-cli](https://www.npmjs.com/package/sequelize-cli) to work with the migration. 
- After installing it let's run our first command line : `npx sequelize-cli init`
  - This will generate a `config` folder in our root folder and `config.json` file like this:
    ```
    {
      "development": {
        "username": "root",
        "password": null,
        "database": "database_development",
        "host": "127.0.0.1",
        "dialect": "mysql"
      },
      "test": {
        "username": "root",
        "password": null,
        "database": "database_test",
        "host": "127.0.0.1",
        "dialect": "mysql"
      },
      "production": {
        "username": "root",
        "password": null,
        "database": "database_production",
        "host": "127.0.0.1",
        "dialect": "mysql"
      }
    }
    ```
  - It also generates several folders: `migrations`, `seeders`, and `models`
- Ok first of all let's modify the `config.json` to be like this : 
  ```
  {
    "development": {
      "username": "root",
      "password": null,
      "database": "joke_factory_development",
      "host": "localhost",
      "dialect": "sqlite",
      "storage": "./database.sqlite",
      "databaseURL": "sqlite:test.sqlite"
    }
  }
  ```
  Great now let's run the cli like this to create the model and also the migration file: 
  ```
  npx sequelize-cli model:generate --name user --attributes username:strin
  g,email:string,password:string
  ```

This will generate two files: `user.js` under `models` and `20230805083922-create-user.js` under migration folder. 

These are all JavaScript fle and contains the code quite similar like our previous implementation: 

`user.js`
```
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};
```

`20230805083922-create-user.js`
```
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
```

Now after that, we can create a database based on that:
```
npx sequelize-cli db:migrate
```

And it would generate a database based on the configuration in the `config/config.json`. On default, we don't specify the environment it would set the environment to be 'development'. 

After we run `npx sequelize-cli db:migrate`, when we run it again and we don't change any of the schema, we will get this : 
```
No migrations were executed, database schema was already up to date.
```

And If we run something like this : 

`
npx sequelize-cli db:migrate:undo
`

It will drop the previous table. 

Now let's enhance our previous table:

```
npx sequelize-cli migration:generate --name user-inactive-column
```

This would generate a new migration file named `user-inactive-column`:

```
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
```

Now let's modify it to add a column into it: 

```
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'inactive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'inactive');
  }
};

```

Now when we run this : `npx sequelize-cli db:migrate`

```
Sequelize CLI [Node: 18.17.0, CLI: 6.6.1, ORM: 6.31.0]

Loaded configuration file "config/config.json".
Using environment "development".
== 20230805083922-create-user: migrating =======
== 20230805083922-create-user: migrated (0.024s)

== 20230807023116-user-inactive-column: migrating =======
== 20230807023116-user-inactive-column: migrated (0.018s)
```

This will run two migration files, and we undo it. : `npx sequelize-cli db:migrate:undo`, it will only remove the `incactive`

If we'd like to undo all the migration: 
```
npx sequelize-cli db:migrate:undo:all
```

If we'd like to do multiple changes:

```
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('users', 'inactive', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }, {transaction});

      await queryInterface.addColumn('users', 'activationToken', {
        type: Sequelize.STRING,
      }, {transaction});

      await transaction.commit();

    } catch{err} {
      await transaction.rollback();
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('users', 'inactive', {transaction});
      await queryInterface.removeColumn('users', 'activationToken', {transaction});
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
    }
  }
};
```

And when we run it again: 
```
npx sequelize-cli db:migrate
```

All the changes are implemented. 

Remember: The most important thing is the migration file. We already have our model file before. 

Therefore let's delete our model folder. 

Now let's work with the `seeder`. Let's run the command : 
```
npx sequelize-cli seed:generate --name add-users
```

It will generate something like this in the `seeders` folder: 

```
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

```

Due to that all of my function in TypeScript, I can't modify it (I'll figure it out later), but it looks like this :

![Alt text](seederFunction.png)

To run the command: 

```
npx sequelize-cli db:seed:all
```

We can move the folder and set up the path: 
- Create a file named: `.sequelizerc`
- And something like this : 
  ```
  const path = require(path);

  module.exports = {
    'config': path.resolve('database', 'config.json'),
    'models-path': path.resolve('database', 'models'),
    'seeders-path': path.resolve('database', 'seeders'),
    'migrations-path': path.resolve('database', 'migrations')
  }
  ```

## Using Migration in our Project
We can use integration the migration above with our current TypeScript Project. 
What we can do is too set the `.sequelizerc` path to the `dist` folder, and run it as usual. 

First let's convert it into Typescript:
- Remember that TS doesn't move our JSON file into `dist` folder, therefore it is considered best practice to put the json file outside of the SRC folder. 
- Now let's create the `.sequelizerc` first :
  ```
  const path = require('path');

  module.exports = {
    'config': path.resolve('sequelize-config.json'),
    'models-path': path.resolve('dist', 'database', 'models'),
    'seeders-path': path.resolve('dist', 'database', 'seeders'),
    'migrations-path': path.resolve('dist', 'database', 'migrations')
  }
  ```
- Then move all the files to the path above. For typescript what we need is to put it under `src`, then TypeScript will compile it into `dist` folder
- Here's the code:
  For Migration User
  ```
  import { QueryInterface, DataTypes } from 'sequelize';

  module.exports = {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      await queryInterface.createTable('users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        username: {
          type: Sequelize.STRING,
          unique: true,
        },
        email: {
          type: Sequelize.STRING,
          unique: true,
        },
        password: {
          type: Sequelize.STRING
        },
        inactive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        activationToken: {
          type: Sequelize.STRING
        },
        passwordResetToken: {
          type: Sequelize.STRING
        },
        image: {
          type: Sequelize.STRING
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
    },

    async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      await queryInterface.dropTable('users');
    }
  }
  ```

  For Migration Auth 
  ```
  import { QueryInterface, DataTypes } from 'sequelize';

  module.exports = {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      await queryInterface.createTable('auth', {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        token: {
          type: Sequelize.STRING,
        },
        userID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'cascade'
        },
        lastUsedAt: {
          type: Sequelize.DATE,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
      });
    },

    async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      await queryInterface.dropTable('auth');
    }
  }

  ```

  For Seeders: 
  ```
  import { QueryInterface, DataTypes } from 'sequelize';
  import bcrypt from 'bcrypt';
  import { UserTypesArray } from '../../models';

  async function hashPassword(plainTextPass: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainTextPass, saltRounds);
    return hash;
  }
  async function addMultipleNewUsersArray(activeUserAccount: number, inactiveUserAccount = 0): Promise<UserTypesArray[]> {
    const userList: UserTypesArray[] = [];                                              
    const password = await hashPassword('A4GuaN@SmZ');
    for (let i=0; i < (activeUserAccount+inactiveUserAccount); i++) {
      const newUser: UserTypesArray = {
        username: `user${i+1}`,
        email: `user${i+1}@gmail.com`,
        password,
        inactive: i >= activeUserAccount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userList.push(newUser);
    }
    return userList;
  }

  module.exports = {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      const newUserArray = await addMultipleNewUsersArray(25);
      await queryInterface.bulkInsert('users', newUserArray, {});
    },

    async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      await queryInterface.bulkDelete('users', {}, {})
    }
  }

  // NOTE: 
  // For somehow when I tried running User Model Helper function 
  // without specifying the environment variable, it breaks. 
  // For ease I duplicate the function. I can refactor it later. 

  ```

Great that's it. Everything works for the creation of the database table, and also for the seeding, now let's move to the test. 

## Running the test using this set up

So far, we run our test against a database in the memory. However in production we're not running it against a database in memory. Therefore we have to create a similar environment. It's called staging. 

Now let's move to the `package.json`. Let's add several script here : 

```
"test:staging": "NODE_ENV=staging jest --runInBand --watchAll",
"migrate:test": "NODE_ENV=staging sequelize-cli db:migrate",
"pretest:staging": "npm run prestart && npm run migrate:test",
"posttest:staging": "NODE_ENV=staging ts-node src/test-cleanup.ts",
```

In the script above we're creating a new script to run the test in the `staging` environment. 

Therefore we need to create a new file for environment : `env.staging` and tweak it a little bit like this : 

```
databaseURL=sqlite:staging.sqlite
logging=false
transporter_config={"host": "localhost","port": 8585,"tls": {"rejectUnauthorized": false}}
jwtkey=this-is-our-secret
uploadDir=uploads-staging
```

Next let's change the config for migration : 
```
{
  "development": {
    "username": "root",
    "password": null,
    "database": "joke_factory_development",
    "host": "localhost",
    "dialect": "sqlite",
    "storage": "./database.sqlite",
    "databaseURL": "sqlite:database.sqlite"
  },
  "staging": {
    "username": "root",
    "password": null,
    "database": "joke_factory_development",
    "host": "localhost",
    "dialect": "sqlite",
    "storage": "./staging.sqlite",
    "databaseURL": "sqlite:database.sqlite"
  }
}

```

NOTE: To be honest, I don't really like about using sqlite for test and also development. I prefer to use postgresql, but this is for the implementation. 

Ok, one more thing. In our test, change before All to ensure it's not creating a new database :

```
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
```

So for staging, when there's no database, the migration file will create it. 

REMEMBER: If we'd like to change the schema, we have to create a new migration file with the newest timeStamp. If not nothing will change. 
Or we can drop the table first. 

## Refactor the configuration

We have two separated configuration, one in the environment variable, and one in the `database-config`. We can change the configuration into JS file, and make it is easier. 

First of let's change the previous configuration file : `sequelize-config.json` into `config.ts`. The new config file will be under `database` folder:

```
import dotenv from 'dotenv';
const environment = process.env.NODE_ENV as string;
dotenv.config({path: `.env.${process.env.NODE_ENV}`});

const dialect = process.env.dialect;

if (process.env.NODE_ENV !== 'production') {
  const storage = process.env.storage;
  module.exports = {
    [environment as string]: {
      dialect: dialect,
      storage: storage,
    },
  };
}
```

Great now let's change the `.sequelizerc` :

```
const path = require('path');

module.exports = {
  'config': path.resolve('dist', 'database', 'config.js' ),
  'models-path': path.resolve('dist', 'database', 'models'),
  'seeders-path': path.resolve('dist', 'database', 'seeders'),
  'migrations-path': path.resolve('dist', 'database', 'migrations')
}
```

As you can see, I changed the implementation a little bit since we don't need user name, etc for sqlite. We only need the storage location. The best way to do this is to use `url`. However, I have no idea why this runs into a problem, therefore, the current workaround is to separate the implementation. 



## Setting Up Postgres

Of course we have to install postgres on our WSL + PGAdmin on Windows. 

Now let's change our configuration:
- Install the `pg` package first: `https://www.npmjs.com/package/pg`. This is to ensure that `sequelize-cli` works. However not really sure about this: and also `pg-hstore`. 
- Then we have to change the environment variable like this : 
  ```
  databaseURL=postgres://postgres:postgres@127.0.0.1:5432/joke-factory
  dialect=postgres
  logging=false
  transporter_config={"host": "localhost","port": 8585,"tls": {"rejectUnauthorized": false}}
  jwtkey=this-is-our-secret
  uploadDir=uploads-staging
  ```
- Then our previous test setting is not working for destroying the table. Instead we have to replace all our setting to be like this : 
  ```
  beforeEach( async () => {
    await User.destroy({where: {}});
    await Auth.destroy({where: {}});
  });
  ```

  This will work both in the sqlite and also postgres.

## Organizing NPM Scripts

Let's make our npm script neater: 

```
"scripts": {
  "start": "npm run clean:compile && NODE_ENV=production npm run migrate && NODE_ENV=production npm run seed && NODE_ENV=production node dist/index.js",
  "dev": "npm run clean:compile && NODE_ENV=development npm run migrate && NODE_ENV=development npm run seed && NODE_ENV=development node dist/index.js",
  "test": "npm run clean:compile && NODE_ENV=test npm run migrate && NODE_ENV=test jest --runInBand --watchAll && NODE_ENV=test npm run clean-up",
  "test:coverage": "npm run clean:compile && NODE_ENV=test npm run migrate && NODE_ENV=test jest --runInBand --coverage && NODE_ENV=test npm run clean-up",
  "test:staging": "NODE_ENV=staging npm run clean:compile && NODE_ENV=staging npm run migrate && NODE_ENV=staging jest --runInBand --watchAll && NODE_ENV=staging npm run clean-up",
  "clean:compile": "rimraf dist && tsc -p tsconfig.build.json",
  "clean-up": "ts-node src/test-cleanup.ts",
  "seed": "sequelize-cli db:seed:all",
  "migrate": "sequelize-cli db:migrate",
  "lint": "eslint .",
  "type:check": "tsc -p .",
  "check": "npm run lint && npm run type:check",
  "placeholder": "npx http-server -c-1 -p 8080 -P http://localhost:3000 --prefix client"
},
```

I'm changing a little bit of the implementation here. 
First of all, I added the seeding command in both start, and dev. 


Then in the `config.ts`` I'm changing a little bit to add for the production: 
```
import dotenv from 'dotenv';
const environment = process.env.NODE_ENV as string;
dotenv.config({path: `.env.${process.env.NODE_ENV}`});

const dialect = process.env.dialect;

if (environment === 'test' || environment === 'development') {
  const storage = process.env.storage;
  module.exports = {
    [environment as string]: {
      dialect: dialect,
      storage: storage,
    },
  };
}

if (environment === 'staging' || environment === 'production' ) {
  const url = process.env.databaseURL;
  module.exports = {
    [environment as string]: {
      dialect: dialect,
      url: url,
    },
  };
}
```

Then in the seeding function, I'm using try and catch to catch for the error: 
```
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    try {
      const newUserArray = await addMultipleNewUsersArray(25);
      await queryInterface.bulkInsert('users', newUserArray, {});
      console.log('Seeding is done');
    } catch(err) {
      console.log('Seeding was done before');
    }
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.bulkDelete('users', {}, {})
  }
}
```


## Logger

Now let's work with the logger. We're going to use a logger, and a library called [`winston`](https://www.npmjs.com/package/winston)

We're replacing our console.log with our logger. 

So here's the set up in our `logger.ts` : 

```
import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import { createLogger, transports, format } from 'winston';

const environment = process.env.NODE_ENV;

if (!environment) {
  throw new Error('Please set up the environment dev either in CLI or ENV doc');
}

const customFormat = format.combine(
  format.timestamp(),
  format.printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase().padEnd(7)}] : ${info.message}`;
  })
);

const consoleTransport = new transports.Console();
const fileTransport = new transports.File({filename: 'app.log'});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const destinations: any[] = [consoleTransport];

if (environment === 'production') {
  destinations.push(fileTransport);
}

export const logger = createLogger({
  transports: destinations,
  level: 'debug',
  format: customFormat,
  silent: environment === 'test' || environment === 'staging',
});

```

Great now let's use it in our `index.ts` and also in our `EmailService.ts`: 
`index.ts`
```
import { app } from './app';
import { sequelize } from './config/database';
import { AuthHelperModel } from './models';
import { logger } from './utils';

const PORT = 3000;

sequelize.sync();

AuthHelperModel.scheduleCleanUp();

app.listen(PORT, () => {
  logger.info(`Listening to port ... ${PORT}. Version: ${process.env.npm_package_version}`);
});

```

Please take a look the above code. In the code above we also logging the version. 

And now here's the `EmailService.ts` : 

```
import { transporter } from '../config/emailTransporter';
import { User } from '../models';
import nodemailer from 'nodemailer';
import { logger } from '../utils';

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
    logger.info(nodemailer.getTestMessageUrl(response));
  }
}

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
    logger.info(nodemailer.getTestMessageUrl(response));
  }
}

```

Using logger is great, however the file will be bigger and bigger if there are many logs, I'm considering to not log it to the file. 



## Fly Io setup

- First of all remove `.env.staging` from the online repository.
- Update the `databaseURL` for staging to test whether it's connected. 
- Now let's prepare for the production database, however before that we have to create the app first, then connect it with the database 
- It is better to do the CI/CD using github or to run the container first before we push the deployment. However, since this is a simple app, then I think I can push it directly. 
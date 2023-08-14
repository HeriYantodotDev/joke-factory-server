# Jokes-Delete

## Joke Delete - Error Cases

Let's create a new test named : `JokeDelete.test.ts`.
Here's the set up and also the first test:

```
import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import request from 'supertest';
import { app } from '../app';
import { sequelize } from '../config/database';
import { Attachment, User, Joke, UserHelperModel} from '../models';
import { optionPostUser } from './UserRegister.test';

import en from '../locales/en/translation.json';
import id from '../locales/id/translation.json';

beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach( async () => {
  await User.destroy({where: {}});
  await Attachment.destroy({where: {}});
  await Joke.destroy({where: {}});
});

afterAll(async () => {
  await sequelize.close();
});

const emailUser1 = 'user1@gmail.com';
const emailUser2 = 'user2@gmail.com';
const passwordUser = 'A4GuaN@SmZ';

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
    token = await response.body.token;
  }

  return token;
}

async function deleteJoke(
  id = 5, 
  options: optionPostUser = {}
){
  const agent = request(app).delete(`/api/1.0/jokes/${id}`);
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }

  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }

  return await agent.send();
}

async function addJokes(userID: number) {
  const joke = await Joke.create({
    content: 'Just a simple content for test',
    timestamp: Date.now(),
    userID,
  });
  return joke;
}

describe('Delete Joke', () => {
  test('returns 403 when request is unauthorized', async () => {
    const response = await deleteJoke();
    expect(response.status).toBe(403);
  });

  test('returns 403 when token is invalid', async () => {
    const response = await deleteJoke(5, {token: 'abc'});
    expect(response.status).toBe(403);
  });

  test.each`
  language    | message
  ${'en'}     | ${en.unAuthJokeDelete}
  ${'id'}     | ${id.unAuthJokeDelete}
  `('return error body with "$message" for unauthorized request when language is "$language"', 
  async({language, message}) => {
    const nowInMS = Date.now();
    const response = await deleteJoke(5, {language});
    expect(response.body.path).toBe('/api/1.0/jokes/5');
    expect(response.body.timeStamp).toBeGreaterThan(nowInMS);
    expect(response.body.message).toBe(message);
  });

  test('returns 403 when a user tries to delete another user\'s jokes', async () => {
    const users = await UserHelperModel.addMultipleNewUsers(2,0);
    const user1 = users[0];
    const user2 = users[1];
    const joke = await addJokes(user1.id);

    const token = await auth({auth: {
      email: emailUser2,
      password: passwordUser,
    }});

    const response = await deleteJoke(joke.id, {token});
    expect(response.status).toBe(403);
  });
});
```

For the implementation: 
- Creating a route: 
  ```
  @del('/:jokeID', JokeHelperController.httpDeleteJokeById)
  jokesDelete(): void{}
  ```
- Throwing an error for the helper: 
  ```
  public static async httpDeleteJokeById(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authenticatedUser = req.authenticatedUser;
      const id = Number(req.params.jokeID);

      throw new ErrorAuthForbidden(Locales.unAuthJokeDelete);

    } catch (err) {
      next(err);
    }
  }
  ```

Just it, now let's move to the next case.  


## Joke Delete - Success Cases

Here's the success case:

```
test('return 200 ok when user deletes their jokes', async() => {
  const users = await UserHelperModel.addMultipleNewUsers(1,0);
  const user1 = users[0];
  const joke = await addJokes(user1.id);

  const token = await auth({auth: {
    email: emailUser1,
    password: passwordUser,
  }});

  const response = await deleteJoke(joke.id, {token});

  expect(response.status).toBe(200);
});

test('removes the joke from the database when user deletes their jokes', async() => {
  const users = await UserHelperModel.addMultipleNewUsers(1,0);
  const user1 = users[0];
  const joke = await addJokes(user1.id);

  const token = await auth({auth: {
    email: emailUser1,
    password: passwordUser,
  }});

  await deleteJoke(joke.id, {token});

  const jokeInDB = await Joke.findOne({where: {
    id: joke.id,
  }});

  expect(jokeInDB).toBeNull();
  
});
```

Now here's the implementation: 

`joke.helper.controller.ts`: 

```
public static async httpDeleteJokeById(
  req: RequestWithAuthenticatedUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authenticatedUser = req.authenticatedUser;
    const jokeID = Number(req.params.jokeID);

    if (!authenticatedUser || !authenticatedUser?.id) {
      throw new ErrorAuthForbidden(Locales.unAuthJokeDelete);
    }
    
    await JokeHelperModel.checkAndDeleteJoke(jokeID, authenticatedUser.id);

    res.send();

  } catch (err) {
    next(err);
  }
}
```

`Joke.helper.model.ts`: 

```
public static async findJokeByIDAndUserID(
  jokeID: number,
  userID: number,
){
  const joke = await Joke.findOne({where: {
    id: jokeID,
    userID: userID
  }});

  return joke;
}

public static async checkAndDeleteJoke(
  jokeID: number,
  userID: number,
) {
  const joke = await JokeHelperModel.findJokeByIDAndUserID(jokeID, userID);

  if (!joke) {
    throw new ErrorAuthForbidden(Locales.unAuthJokeDelete);
  }

  await joke.destroy();
}
```

Great now we're passing the test. 

## Joke Delete - Cascade

Ok now here's our test. In our test below: we not only testing for the joke to be removed from the database, but also for the attachment entry in the database, along with the local files: (there are some functions added to the test. Check the file test for the detail)

```
test('removes file Attachment the database when user deletes their jokes', async() => {
  const users = await UserHelperModel.addMultipleNewUsers(1,0);
  const user1 = users[0];
  const joke = await addJokes(user1.id);
  const attachment = await addAttachment(joke.id);

  const token = await auth({auth: {
    email: emailUser1,
    password: passwordUser,
  }});

  await deleteJoke(joke.id, {token});

  const attachmentInDB = await Attachment.findOne({where: {
    id: attachment.id,
  }});

  expect(attachmentInDB).toBeNull(); 
});

test('removes file from the local storage when user deletes their jokes', async() => {
  const users = await UserHelperModel.addMultipleNewUsers(1,0);
  const user1 = users[0];
  const joke = await addJokes(user1.id);
  await addAttachment(joke.id);

  const token = await auth({auth: {
    email: emailUser1,
    password: passwordUser,
  }});

  await deleteJoke(joke.id, {token});

  expect(fs.existsSync(targetPath)).toBe(false);
});
```

First off all let's create a new function to delete attachment in `File.util.ts`: 

```
public static async deleteAttachment(filename: string) {
  const filePath = path.join(attachmentFolder, filename);
  try {
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
  } catch (err) {
    //
  }
}
```

Now let's modify our function in the model helper function: 

```
public static async findJokeByIDAndUserID(
  jokeID: number,
  userID: number,
){
  const joke = await Joke.findOne(
    { where: 
      {
        id: jokeID,
        userID: userID
      },
      include: {
        model: Attachment
      }
    });

  return joke;
}

public static async checkAndDeleteJoke(
  jokeID: number,
  userID: number,
) {
  const joke = await JokeHelperModel.findJokeByIDAndUserID(jokeID, userID);

  if (!joke) {
    throw new ErrorAuthForbidden(Locales.unAuthJokeDelete);
  }

  const jokeJSON = joke.get({plain: true}) as any;

  if (jokeJSON.attachment) {
    await FileUtils.deleteAttachment(jokeJSON.attachment.filename);
  }

  await joke.destroy();
}
```

## Updating Migration



## User Delete

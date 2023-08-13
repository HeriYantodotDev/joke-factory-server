# Joke Attachment

We will add attachment to our Joke Feature.

## Attachment Folder

First off all let's create a folder named 'attachment':
- Test:
  ```
  test('creates attachment folders under upload folder', () => {
    FileUtils.createFolders();
    const attachmentFolder = path.join('.', uploadDir, attachmentDir);
    expect(fs.existsSync(attachmentFolder)).toBe(true);
  });
  ```
- Implementation: 
  ```
  const uploadDir = process.env.uploadDir;
  const profileDir = 'profile';
  const attachmentDir = 'attachment';

  const profileFolder = path.join('.', uploadDir, profileDir);
  const attachmentFolder = path.join('.', uploadDir, attachmentDir);
    public static createFolders() {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      if (!fs.existsSync(profileFolder)) {
        fs.mkdirSync(profileFolder);
      }

      if (!fs.existsSync(attachmentFolder)) {
        fs.mkdirSync(attachmentFolder);
      }
    }
  ```
  The implementation is very simple we just adding a function to create a folder named `attachment`

## Storing Attachment info in DB

We're going to add a functionality to add attachment, however it's a separated end point with updating Jokes.

As soon as the user attaches a file, it begins to be uploaded. 

Let's create a new test module named `Attachment.test.ts`. The idea is that any user can upload any file and later we will clean up the attachment if it's not associated with any Joke. 

Now let's create our first test: 
- Test:
  ```
  import request from 'supertest';
  import { app } from '../app';
  import path = require('path');

  const filePath = path.join('.', 'src',  '__tests__', 'resources', 'test-png.png');

  describe('Upload File for Joke', () => {
    it('returns 200 ok after successful upload', async() => {
      const response = await request(app)
        .post('/api/1.0/jokes/attachments')
        .attach('file', filePath);
      expect(response.status).toBe(200);
    });
  });
  ```
- Implementation: 
  In the `joke.controller`:
  ```
  @post('/attachments', JokeHelperController.httpJokeAttachmentPost )
  jokesAttachmentPost(): void{}
  ```
  Then in the `joke.helper.controller`:
  ```
  public static async httpJokeAttachmentPost(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.send();
  }
  ```

Now, let's move to the next step. We're going to use database now, therefore let's add something to our test, and also for the next test: 
- Test. The test below will check when we make a request, the app will save the file name, and also the date when it uploads. 
  ```
  import request from 'supertest';
  import path = require('path');
  import { sequelize } from '../config/database';
  import { app } from '../app';
  import { Attachment } from '../models';

  const filePath = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');

  async function uploadFile() {
    const response = await request(app)
      .post('/api/1.0/jokes/attachments')
      .attach('file', filePath);
    return response;
  }

  beforeAll( async () => {
    if (process.env.NODE_ENV === 'test') {
      await sequelize.sync();
    }
  });

  beforeEach( async () => {
    await Attachment.destroy({where: {}});
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Upload File for Joke', () => {
    it('returns 200 ok after successful upload', async() => {
      const response = await uploadFile();
      expect(response.status).toBe(200);
    });

    it('saves dynamicFilename, uploadDate as attachment object in database', async() => {
      const beforeSubmit = Date.now();
      await uploadFile();

      const attachments = await Attachment.findAll();
      const attachment = attachments[0];
      expect(attachments.length).toBe(1);
      expect(attachment.filename).not.toBe('test-png.png');
      expect(attachment.updatedAt.getTime()).toBeGreaterThan(beforeSubmit);
      
    });
  });
  ```
- Implementation
  First of all we have to create a model for this:
  `Attachment.model.ts`
  ```
  import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    DataTypes,
    ForeignKey
  } from 'sequelize';

  import { sequelize } from '../../config/database';

  export class Attachment extends Model<
    InferAttributes<Attachment>,
    InferCreationAttributes<Attachment>
  > {
    declare id: CreationOptional<number>;
    declare filename: string;
    declare uploadDate: Date;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
  }

  Attachment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      filename: DataTypes.STRING,
      uploadDate: DataTypes.DATE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'attachment',
    }
  );
  ```

  And also the migration file :
  ```
  import { QueryInterface, DataTypes } from 'sequelize';

  module.exports = {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      await queryInterface.createTable('attachments', {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        filename: {
          type: Sequelize.STRING,
        },
        uploadDate: {
          type: Sequelize.DATE,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
      });
    },

    async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      await queryInterface.dropTable('attachments');
    }
  }
  ``` 

  Great, let's add a function in the `Attachment.helper.model.ts` :
  ```
  import { Attachment } from './Attachment.model';
  import { AuthHelperModel } from '../auth';

  export class AttachmentHelperModel {
    public static async createAttachment(

    ) {
      await Attachment.create({
        filename: AuthHelperModel.randomString(10),
        uploadDate: new Date(),
      })
    }
  }
  ```

  Okay, how here's the function in `joke.helper.controller.ts`: 
  ```
  public static async httpJokeAttachmentPost(
    req: RequestWithAuthenticatedUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    await AttachmentHelperModel.createAttachment();
    res.send();
  }
  ```

Okay, now we're passing the test, let's move to store the attachment file. 

## Storing Attachment File

We already store the related information about attachment like the filename, and also the timeStamp, however, we haven't stored the file yet. Let's begin to create the functionality for it. 

- Test: 
  ```
  it('saves file to attachment folder', async() => {
    await uploadFile();

    const attachments = await Attachment.findAll();
    const attachment = attachments[0];

    const filePath = path.join(attachmentFolder, attachment.filename);

    expect(fs.existsSync(filePath)).toBe(true);
  });
  ```
  For the test, we have to get the environment variable to create a path. 

- Implementation: 
  We're going to use this library: [`Multer`](https://www.npmjs.com/package/multer). 

  After install it now let's add it as a middleware in our controller: 
  ```
  import multer from 'multer';
  const attachmentName = 'file';
  const upload = multer();
  const uploadMW = upload.single(attachmentName);

  @post('/attachments', JokeHelperController.httpJokeAttachmentPost )
  @use(uploadMW)
  jokesAttachmentPost(): void{}
  ```

  Now in the controller helper, we are calling the same function, however this time we have `req.file` since the previous middleware adds it, so we have to change the type for the `req` like this: 

  ```
  public static async httpJokeAttachmentPost(
    req: RequestWithAuthenticatedUser & RequestWithFile,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.file) {
      throw new Error('Something wrong with the Multer Module, please check it');
    }

    await AttachmentHelperModel.createAttachment(req.file);
    res.send();
  }
  ```

  Great! Now, let's modify it our helper function: 

  ```
  public static async httpJokeAttachmentPost(
    req: RequestWithAuthenticatedUser & RequestWithFile,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.file) {
      throw new Error('Something wrong with the Multer Module, please check it');
    }

    await AttachmentHelperModel.createAttachment(req.file);
    res.send();
  }
  ```

  Okay, we haven't handled the error for this, but let's do it later. Now in the model helper before we're saving information to the database, we're calling function from `FileUtils` to save it locally: 

  ```
  public static async createAttachment(
    file: Express.Multer.File
  ) {
    const filename = await FileUtils.saveAttachment(file);

    await Attachment.create({
      filename,
      uploadDate: new Date(),
    });
  }
  ```

  Now finally in the `FileUtils`: 

  ```
  public static async saveAttachment(file: Express.Multer.File){
    const filename = AuthHelperModel.randomString(32);

    const attachmentPath = path.join(attachmentFolder, filename);

    await fs.promises.writeFile(attachmentPath, file.buffer);

    return filename;
  }
  ```

  We're saving te file locally, and return the filename to be stored in the database. Now for the final touch for our test is to do the clean up: 

  ```
  import dotenv from 'dotenv';
  dotenv.config({path: `.env.${process.env.NODE_ENV}`});
  import fs from 'fs';
  import path from 'path';

  const uploadDir = process.env.uploadDir;

  const profileDir = 'profile';

  const attachmentDir = 'attachment';

  if (!uploadDir) {
    throw new Error('Please set up the uploadDir environment');
  }

  const profileDirectory = path.join('.', uploadDir, profileDir);
  const attachmentDirectory = path.join('.', uploadDir, attachmentDir);

  function clearFolders(folderPath: string) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      fs.unlinkSync(path.join(folderPath, file));
    }
  }

  clearFolders(profileDirectory);
  clearFolders(attachmentDirectory);
  ```

  I refactored it so we don't repeat ourselves by creating a function to clean up the folder. 
  


## Serving Attachment Folder

## Storing File Type

## File Size Limit

## Attachment Joke Relationship

## Attachment in Joke Listing

## Migration Scripts

## Scheduled Service for Unused Attachment


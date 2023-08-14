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
k
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

We already save our file in our local files, now let's use it as a static file now. 
Now let's add test to `ServingStaticResources.test.ts`. I had to tweak it a little bit so we don't repeat ourselves: 

```
import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { app } from '../app';

const uploadDir = process.env.uploadDir;

const attachmentDir = 'attachment';
const profileDir = 'profile';

if (!uploadDir) {
  throw new Error('Please set up the uploadDir environment');
}

const filePath = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');
const storedFileName = 'test-file';
const storedAttachmentName = 'test-attachment-file';

const profileDirectory = path.join('.', uploadDir, profileDir);
const attachmentDirectory = path.join('.', uploadDir, attachmentDir);

const imageProfilePath = path.join(profileDirectory, storedFileName);
const imageProfileApiUrl = `/images/${storedFileName}`;

const attachmentPath = path.join(attachmentDirectory, storedAttachmentName);
const attachmentApiUrl = `/attachments/${storedAttachmentName}`;

async function copyFileAndSendRequest(targetPath = imageProfilePath, apiUrl = imageProfileApiUrl ) {
  fs.copyFileSync(filePath, targetPath);
  const response = await request(app).get(apiUrl);
  return response;
}


describe('Profile Images', () => {
  test('returns 404 when file not found', async() => {
    const response = await request(app).get('/images/123456');
    expect(response.status).toBe(404);
  });

  test('returns 200 when file exists', async() => {
    const response = await copyFileAndSendRequest();
    expect(response.status).toBe(200);
  });

  test('returns cached for 1 year in response', async() => {
    const response = await copyFileAndSendRequest();
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    expect(response.header['cache-control']).toContain(`max-age=${oneYearInSeconds}`);
  });
});

describe('Joke Attachments', () => {
  test('returns 404 when file not found', async() => {
    const response = await request(app).get('/attachments/123456');
    expect(response.status).toBe(404);
  });

  test('returns 200 when file exists', async() => {
    const response = await copyFileAndSendRequest(attachmentPath, attachmentApiUrl);
    expect(response.status).toBe(200);
  });

  test('returns cached for 1 year in response', async() => {
    const response = await copyFileAndSendRequest(attachmentPath, attachmentApiUrl);
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    expect(response.header['cache-control']).toContain(`max-age=${oneYearInSeconds}`);
  });
});
```

Now for the Implementation we only need to add it into our `configStaticFiles`:
```
private static configStaticFiles(): void {
  if (!process.env.uploadDir) {
    throw new Error('Please set up the uploadDir environment');
  }
  
  const uploadDir = process.env.uploadDir;
  const profileDir = 'profile';
  const attachmentDir = 'attachment';
  const profileFolder = path.join('.', uploadDir, profileDir);
  const attachmentFolder = path.join('.', uploadDir, attachmentDir);

  app.use('/images', express.static(profileFolder, {maxAge: ONE_YEAR_IN_MS}));
  app.use('/attachments', express.static(attachmentFolder, {maxAge: ONE_YEAR_IN_MS}));
}
```

## Storing File Type

Let's enhance our attachment feature. User can attach anything, there's not restriction for it, however it will be beneficial if we store the file type. 

However, due to problem with `file-type` with JEST. I decided to create my own function, this is not a good solution though, however, it's okay for this simple app. I'm thinking that it is better if we limit the file type that user can upload, but let's do it later. 

So here's my function to identify file type named: `identifyFileType.ts`: 

```
//I have a problem with file-type package, therefore I created this simple one 
interface fileSignatures {
  [key: string]: string,
}

export interface IdentifyFileTypeResponse {
  fileType: string,
  fileExt: string | null,
}

const fileSignatures:fileSignatures = {
  '89504E47': 'image/png',
  'FFD8FF': 'image/jpg',
  '47494638': 'image/gif',
  '25504446': 'application/pdf',
  '504B0304': 'application/zip',
  '52617221': 'application/x-rar-compressed',
  '424D': 'image/bmp',
  '3C3F786D6C': 'application/xml',
  '504B030414': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '504B030414000600': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '504B030414000208': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '377ABCAF271C': 'application/x-7z-compressed',
  'D0CF11E0A1B11AE1': 'application/msword',
  '504B0708': 'application/java-archive',
  '7573746172': 'application/x-tar',
  '1F8B08': 'application/gzip',
  '4D5A': 'application/x-msdownload',
  '57415645': 'audio/wav',
  '464C56': 'video/x-flv',
  '464F524D': 'audio/midi',
  // Add more signatures and types as needed
};

const mimeTypeMapping: fileSignatures = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'image/bmp': 'bmp',
  'application/xml': 'xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/x-7z-compressed': '7z',
  'application/msword': 'doc',
  'application/java-archive': 'jar',
  'application/x-tar': 'tar',
  'application/gzip': 'gzip',
  'application/x-msdownload': 'msdownload',
  'audio/wav': 'wav',
  'video/x-flv': 'flv',
  'audio/midi': 'midi',
  // Add more mappings as needed
};

export function identifyFileType(buffer: Buffer): IdentifyFileTypeResponse {
  const subBuffer = buffer.subarray(0, 8);
  const signature = subBuffer.toString('hex').toUpperCase();

  const key = Object.keys(fileSignatures).find(magicNumber => signature.startsWith(magicNumber));

  if (!key) {
    return {
      fileType: 'UNKNOWN',
      fileExt: null,
    };
  }

  return {
    fileType: fileSignatures[key],
    fileExt: mimeTypeMapping[fileSignatures[key]],
  };
}
```

I only listed 20 common file types, and for the rest I will just list it as unknown. 

Great now let's add the test: 

```
test.each`
file                | fileType
${'test-png.png'}   | ${'image/png'}
${'test-png'}       | ${'image/png'}
${'test-gif.gif'}   | ${'image/gif'}
${'test-jpg.jpg'}   | ${'image/jpg'}
${'test-pdf.pdf'}   | ${'application/pdf'}
${'test-txt.txt'}   | ${'UNKNOWN'}
`('saves filetype as $fileType when this file $file is uploaded', async({file, fileType}) => {
  await uploadFile(file);

  const attachments = await Attachment.findAll();
  const attachment = attachments[0];
  expect(attachment.fileType).toBe(fileType);
});

test.only.each`
file                | fileExtension
${'test-png.png'}   | ${'png'}
${'test-png'}       | ${'png'}
${'test-gif.gif'}   | ${'gif'}
${'test-jpg.jpg'}   | ${'jpg'}
${'test-pdf.pdf'}   | ${'pdf'}
${'test-txt.txt'}   | ${'txt'}
`('saves filename with $fileExtension when this file $file is uploaded', async({file, fileExtension}) => {
  await uploadFile(file);

  const attachments = await Attachment.findAll();
  const attachment = attachments[0];

  const expectedResult = file === 'test-txt.txt'? false: true;

  expect(attachment.filename.endsWith(fileExtension)).toBe(expectedResult);

  const filePath = path.join(attachmentFolder, attachment.filename );
  expect(fs.existsSync(filePath)).toBe(true);
});
```

Now here's the implementation : 

`Attachment.helper.model.ts`: 

```
export class AttachmentHelperModel {
  public static async createAttachment(
    file: Express.Multer.File
  ) {
    const fileIdentification = identifyFileType(file.buffer);
    const filename = await FileUtils.saveAttachment(file, fileIdentification);
    await Attachment.create({
      filename,
      fileType: fileIdentification.fileType,
      uploadDate: new Date(),
    });
  }
}
```

And here's the implementation in the `File.util.ts`: 

```
public static async saveAttachment(file: Express.Multer.File, fileIdentification: IdentifyFileTypeResponse){
  const randomString = AuthHelperModel.randomString(32);
  const filename = fileIdentification.fileExt
    ? `${randomString}.${fileIdentification.fileExt}`
    : `${randomString}`;
  const attachmentPath = path.join(attachmentFolder, filename);
  await fs.promises.writeFile(attachmentPath, file.buffer);
  return filename;
}
```



## File Size Limit
We haven't checked the file size limit for this app. Therefore we're going to define a limit for it. 

Now here's the test:
- Test
  ```
  test('returns 400 when uploaded file size is bigger than 5 mb', async() => {
    const five5MB = 5 * 1024 * 1024;
    const filePath = path.join('.', 'src', '__tests__', 'resources', 'random-file');
    fs.writeFileSync(filePath, 'a'.repeat(five5MB) + 'a');
    const response = await uploadFile('random-file');
    expect(response.status).toBe(400);
    fs.unlinkSync(filePath);
  });

  test('returns 200 when uploaded file size is exactly 5 mb', async() => {
    const five5MB = 5 * 1024 * 1024;
    const filePath = path.join('.', 'src', '__tests__', 'resources', 'random-file');
    fs.writeFileSync(filePath, 'a'.repeat(five5MB));
    const response = await uploadFile('random-file');
    expect(response.status).toBe(200);
    fs.unlinkSync(filePath);
  });

  test.each`
  lang        | message
  ${'en'}     | ${en.attachmentSizeLimit}
  ${'id'}     | ${id.attachmentSizeLimit}
  `('returns $message if the attachment is >5MB and the language is $lang', async({lang, message}) => {
    const nowInMS = Date.now();
    const five5MB = 5 * 1024 * 1024;
    const filePath = path.join('.', 'src', '__tests__', 'resources', 'random-file');
    fs.writeFileSync(filePath, 'a'.repeat(five5MB) + 'a');
    const response = await uploadFile('random-file', {language: lang});
    const error = response.body;

    expect(error.path).toBe('/api/1.0/jokes/attachments');
    expect(error.message).toBe(message);
    expect(error.timeStamp).toBeGreaterThan(nowInMS);
    fs.unlinkSync(filePath);
  });
  ```
- Implementation
  What we need is to create our own middleware using `multer`. So let's remove the previous implementation about multer and add to its own module called `uploadMW`:
  ```
  import { RequestWithAuthenticatedUser, RequestWithFile} from '../../models';
  import { Response, NextFunction } from 'express';
  import multer from 'multer';
  import { ErrorHandle, ErrorFileSizeLimit} from '../Errors';

  const attachmentName = 'file';
  const MAX_SIZE = (5 * 1024 * 1024) + 1;
  const upload = multer({limits: {fileSize: MAX_SIZE} }).single(attachmentName);

  export async function uploadMW(
    req: RequestWithAuthenticatedUser & RequestWithFile,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    upload(req, res, (err) => {
      if (err) {
        ErrorHandle(new ErrorFileSizeLimit(), req, res, next);
        return;
      }
      next();
    });
  }
  ```

  Also to create a translation and enum for this : `"attachmentSizeLimit": "Uploaded file cannot be bigger than 5MB"`. The next thing is to create a new error class: 
  ```
  export class ErrorFileSizeLimit extends Error {
    public code = 400;
    constructor(message = Locales.attachmentSizeLimit) {
      super(message);
    }
  }
  ```

  Anyway this error classes gets bloated. I think I have to refactor it later, so it has a generic class error in which we call it and pass the message. Since all the code is 400. There are 8 classes not that we should handle all the time. 

## Attachment Joke Relationship
Now let's the association between the attachment and the jokes. 

Let's create the test:
- test:
  ```
  test('returns attachment id in response', async () => {
    const response = await uploadFile();
    expect(Object.keys(response.body)).toEqual(['id']);
  });
  ```
  This checks whether the end point sends back the object contains id for the attachment. 
- implementation: 
  In the `attachment.helper.model.ts`:
  ```
  public static async createAttachment(
    file: Express.Multer.File
  ) {
    const fileIdentification = identifyFileType(file.buffer);
    const filename = await FileUtils.saveAttachment(file, fileIdentification);
    const savedAttachment = await Attachment.create({
      filename,
      fileType: fileIdentification.fileType,
      uploadDate: new Date(),
    });

    return {
      id: savedAttachment.id,
    }
  }
  ```
  We just return the ID of the new attachment entries. 

  And in the `joke.helper.controller.ts`: 
  ```
  public static async httpJokeAttachmentPost(
    req: RequestWithAuthenticatedUser & RequestWithFile,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new Error('Something wrong with the Multer Module, please check it');
      }
  
      const attachmentObject = await AttachmentHelperModel.createAttachment(req.file);
      res.send(attachmentObject);
      return;
    }
    catch (err) {
      next(err);
      return;
    }
  }
  ```
  We just send it to the client. 


Now let's create a new test in the `JokeSubmit.test.ts` :

```
test('associates jokes with attachment in database', async () => {
  const uploadResponse = await uploadFile();
  const uploadedFileId = uploadResponse.body.id;

  const user = await UserHelperModel.addMultipleNewUsers(1,0);

  await postJoke(
    {
      content,
      fileAttachment: uploadedFileId,
    }, 
    {
      auth: {email: emailUser1, password: passwordUser1},
    }
  );

  const jokes = await Joke.findAll();
  const joke = jokes[0];

  const attachmentInDb = await Attachment.findOne({
    where: {id: uploadedFileId},
  });

  expect(attachmentInDb.jokeID).toBe(joke.id);
});
```

In this test, we uploaded a file, and then make a post request to joke endpoint wit the attachment ID. Then we are checking if the entries in the attachment has the joke.id.

So how's the implementation? 
- Update the model and also the migration file: 
  First we have to update the model for Joke and also Attachment: 
  `Joke.model.ts`:
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

  import { Attachment } from '../attachment';

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

  Joke.hasOne(Attachment, {
    onDelete: 'cascade',
    foreignKey: 'jokeID'
  })

  ```
  And here's for the `Attachment.model.ts`:
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
    declare fileType: string;
    declare jokeID: ForeignKey<number | null>;
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
      fileType: DataTypes.STRING,
      jokeID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'attachment',
    }
  );
  ```

  Now for the create-attachments migration file: 

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
        fileType: {
          type: Sequelize.STRING,
        },
        jokeID: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'jokes',
            key: 'id'
          },
          onDelete: 'cascade'
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

- Function Update
  In the `Attachment.helper.model.ts` we add a new function: 
  ```
  public static async associateAttachmentToJoke(
    fileAttachmentID: number,
    jokeID: number
  ) {
    const attachment = await Attachment.findOne({
      where: {
        id: fileAttachmentID,
      }
    });

    if (!attachment) {
      throw new Error('Something wrong with the fileAttachment');
    }

    attachment.jokeID = jokeID;

    await attachment.save();
  }
  ```

  Great now, we have to call this function inside `Joke.helper.model`:
  ```
  public static async createJoke(
    body: BodyRequestHttpPostJokeType,
    user: UserWithIDOnlyNumber
  ) {
    const joke: JokeObjectType = {
      content: body.content,
      timestamp: Date.now(),
      userID: user.id,
    }
    
    const {id} = await Joke.create(joke);
    if (body.fileAttachment) {
      await AttachmentHelperModel.associateAttachmentToJoke(body.fileAttachment, id);
    }
  }
  ```

  In the function above we check if the client also sends the fileAttachment, if yes, then we will create an association between them. 

  Last thing is about our validation. In our validation, we don't allow custom field, so we need to add `fileAttachment` as an optional: 

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
    fileAttachment: Joi.optional(),
  }).options({
      allowUnknown: false,
  }).messages({
    'object.unknown': Locales.customFieldNotAllowed,
  });
  ```

Now let's add another test to make our implementation is stable: 

```
  test('returns 200 Ok when the attachment doesn\'t exist', async () => {
    await UserHelperModel.addMultipleNewUsers(1,0);

    const response = await postJoke(
      {
        content,
        fileAttachment: 1000,
      }, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    expect(response.status).toBe(200);
  });

  test('keeps the old associate when new Joke submitted with a new attachment ID', async () => {
    const uploadResponse = await uploadFile();
    const uploadedFileId = uploadResponse.body.id;

    await UserHelperModel.addMultipleNewUsers(1,0);

    await postJoke(
      {
        content,
        fileAttachment: uploadedFileId,
      }, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    const attachment = await Attachment.findOne({
      where: {id: uploadedFileId},
    });

    await postJoke(
      {
        content : 'Next Content Of 2',
        fileAttachment: uploadedFileId,
      }, 
      {
        auth: {email: emailUser1, password: passwordUser1},
      }
    );

    const attachmentAfterSecondPost = await Attachment.findOne({
      where: {id: uploadedFileId},
    });

    expect(attachment?.jokeID).toBe(attachmentAfterSecondPost?.jokeID);
  });

```

Great now those two test will check even though the fileAttachment is invalid, saving to the database is still successful. Also if it's already associated, then we don't change it. 

The implementation is simple we only checks for whether the attachment exist or attachment.jokeID exist then return the function: 

```
public static async associateAttachmentToJoke(
  fileAttachmentID: number,
  jokeID: number
) {
  const attachment = await Attachment.findOne({
    where: {
      id: fileAttachmentID,
    }
  });

  if (!attachment) {
    return;
  }

  if (attachment.jokeID) {
    return;
  }

  attachment.jokeID = jokeID;
  await attachment.save();
}
```

## Attachment in Joke Listing

Okay, now let's move to the listing part. 
We're adding test to the `JokeListing.test.ts`: 

```
test('returns fileAttachment having filename, fileType if joke has any ', async () => {
  const jokeIDs = await addJokes(1);
  await addFileAttachment(jokeIDs[0]);

  const response = await getJokes();
  const joke = response.body.content[0];
  const jokeKeys = Object.keys(joke);

  expect(jokeKeys).toEqual(['id', 'content', 'timestamp', 'user', 'fileAttachment']);

  const fileAttachmentKeys = Object.keys(joke.fileAttachment);

  expect(fileAttachmentKeys).toEqual(['filename', 'fileType']);
});
```

For this test, when we lists the jokes, we also would get the `fileAttachment` object which contains `filename`, and `fileType`. In this test, we have to ensure that we only return `fileAttachment` object we there's an attachment, if not than we don't have to return it. 

Let's move to the `Joke.helper.model.ts`, we have to modify it a little bit so it returns the `attachment` data but we should control the response too:

```
public static async getAllJokes(
  page: number, 
  size: number,
  userID: number | null = null,
): Promise<JokePaginationResponseTypes>{

  let whereClause = {};
  if (userID) {
    whereClause = {
      userID
    }
  }

  const jokeList = await Joke.findAndCountAll({
    where: whereClause,
    attributes: ['id', 'content', 'timestamp'],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'image'],
      },
      {
        model: Attachment,
        as: 'attachment',
        attributes: ['filename', 'fileType']
      }
    ],
    order: [['id', 'DESC']],
    limit: size,
    offset: page * size,
  });

  const totalPages = JokeHelperModel.getPageCount( jokeList.count, size);

  const properJokeList = JokeHelperModel.generateJokeList(jokeList.rows);

  return JokeHelperModel.generateResUserPagination(
    properJokeList as unknown as JokeContentResponseForClientTypes[], 
    totalPages, 
    page, 
    size
  );
}

public static generateJokeList(jokeList: Joke[]) {

  const newContent = jokeList.map((joke) => {
    const jokeAsJSON = joke.get({plain: true}) as any;
    if (jokeAsJSON.attachment === null) {
      delete jokeAsJSON.attachment;
    }

    if (jokeAsJSON.attachment) {
      jokeAsJSON.fileAttachment = jokeAsJSON.attachment;
      delete jokeAsJSON.attachment;
    }

    return jokeAsJSON;
  });

  return newContent; 
}
```

And also the types :

```
export interface JokePaginationResponseTypes {
  content: JokeContentResponseForClientTypes[],
  page: number,
  size: number,
  totalPages: number,
}

export interface JokeContentResponseForClientTypes {
  id: number,
  content: string,
  timestamp: number,
  user: {
    id: number,
    username: string,
    email: string,
    image: string,
  }
  fileAttachment?: {
    filename: string,
    fileType: string,
  }
}
```

Great, now let's to move the end point in which we only ask for a user: 

```
test('returns fileAttachment having filename, fileType if joke has any ', async () => {
  const user = await UserHelperModel.addMultipleNewUsers(1,0);
  const jokeIDs = await addJokes(1, user[0].id);
  await addFileAttachment(jokeIDs[0]);

  const response = await getJokes(user[0].id);
  const joke = response.body.content[0];
  const jokeKeys = Object.keys(joke);

  expect(jokeKeys).toEqual(['id', 'content', 'timestamp', 'user', 'fileAttachment']);

  const fileAttachmentKeys = Object.keys(joke.fileAttachment);

  expect(fileAttachmentKeys).toEqual(['filename', 'fileType']);
});
```

This is also passing and we don't have to change anything. 

## Scheduled Service for Unused Attachment

We will store the attachment, but the user might not post the joke. This will cause that we will have a lot of file that is not associated with any joke. 

We should have a schedule service to clean up this file regularly. 

Now let's create a test in the `FileService.test`:

```
describe('Scheduled unused attachment clean up', () => {
  const filename = `test-file${Date.now()}`;
  const testFile = path.join('.', 'src', '__tests__', 'resources', 'test-png.png');
  const targetPath = path.join(attachmentFolder, filename);

  async function addJokes(count: number) {
    const jokeIDs = [];
    const user = await UserHelperModel.addMultipleNewUsers(count,0);
    for (let i=0; i < count; i++) {
      const joke = await Joke.create({
        content: `Content Of Great Jokes all ${i+1}`,
        timestamp: Date.now(),
        userID: user[i].id,
      });
      jokeIDs.push(joke.id);
    }
    return jokeIDs;
  }


  beforeEach(async() => {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  });

  test.only('removes the 24 hours old file with attachment entry if not associated in joke', async() => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const uploadDate = new Date(Date.now() - (24 * 60 * 60 * 1000) - 1 );
    const attach = await Attachment.create({
      filename: filename,
      uploadDate: uploadDate,
      fileType: 'png',
    });

    await FileUtils.removeUnusedAttachments();
    jest.advanceTimersByTime((24 * 60 * 60 * 1000) + 5000 );
    setTimeout(async () => {
      const attachmentAfterRemove = await Attachment.findOne({
        where: {
          id: attach.id,
        },
      });
      expect(attachmentAfterRemove).toBe(null);
      expect(fs.existsSync(targetPath)).toBe(false);
    }, 1000);
  });

  test('keeps the files older than 24 hours and their database entry if there\'s an association ', async() => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const id = await addJokes(1);
    const uploadDate = new Date(Date.now() - (48 * 60 * 60 * 1000) + 1);
    const attach = await Attachment.create({
      filename: filename,
      uploadDate: uploadDate,
      fileType: 'png',
      jokeID: id[0],
    });

    await FileUtils.removeUnusedAttachments();
    jest.advanceTimersByTime((24 * 60 * 60 * 1000) + 5000 );
    setTimeout(async () => {
      const attachmentAfterRemove = await Attachment.findOne({
        where: {
          id: attach.id,
        },
      });
      expect(attachmentAfterRemove).not.toBe(null);
      expect(fs.existsSync(targetPath)).toBe(true);
    }, 1000);
  });

  test.only('keeps files younger than 23 hours and their database entry even without association ', async() => {
    jest.useFakeTimers();
    fs.copyFileSync(testFile, targetPath);
    const uploadDate = new Date(Date.now() - (24 * 60 * 60 * 1000) );
    const attach = await Attachment.create({
      filename: filename,
      uploadDate: uploadDate,
      fileType: 'png',
    });
  
    await FileUtils.removeUnusedAttachments();
    jest.advanceTimersByTime((23 * 60 * 60 * 1000) + 5000 );
    setTimeout(async () => { 
      const attachmentAfterRemove = await Attachment.findOne({
        where: {
          id: attach.id,
        },
      });
  
      expect(attachmentAfterRemove).not.toBe(null);
      expect(fs.existsSync(targetPath)).toBe(true);
    }, 1000);
  });
});
```

And here's the implementation: 

```
public static async removeUnusedAttachments() {
  const ONE_DAY = (24 * 60 * 60 * 1000);
  setInterval(async () => {
    const oneDayOld = new Date(Date.now() - ONE_DAY);
    const attachments = await Attachment.findAll({
      where: {
        uploadDate: {
          [Op.lt]: oneDayOld,
        },
        jokeID: {
          [Op.is]: null,
        },
      },
    });

    for (const attachment of attachments) {
      const {filename} = attachment.get({plain: true});
      await fs.promises.unlink(path.join(attachmentFolder, filename));
      await attachment.destroy();
    }
  }, ONE_DAY);
}
```

The last thing is to add this function in our `index.ts`: 

```
import { app } from './app';
import { sequelize } from './config/database';
import { AuthHelperModel } from './models';
import { logger, FileUtils} from './utils';

const PORT = process.env.port || 3000;

sequelize.sync();

AuthHelperModel.scheduleCleanUp();
FileUtils.removeUnusedAttachments();

app.listen(PORT, () => {
  logger.info(`Listening to port ... ${PORT}. Version: ${process.env.npm_package_version}`);
});

```

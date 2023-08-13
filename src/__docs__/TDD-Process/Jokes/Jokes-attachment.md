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

## Attachment Joke Relationship

## Attachment in Joke Listing

## Migration Scripts

## Scheduled Service for Unused Attachment


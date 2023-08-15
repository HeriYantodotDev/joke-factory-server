# Joke Factory Project Server
Hey there, welcome to this repository! The Joke Factory is like a cool pit stop on my learning journey. Imagine it as an app where folks can swap hilarious jokes and just have a blast together!

This repository constitutes the project's backend framework, embodying my dedicated journey towards learning the art of Test-Driven Development (TDD) in TypeScript. Through the meticulous practice of TDD, I am actively honing the skill of crafting immaculate code, consistently refining and enhancing the foundation of this project.

Here are the essential links you'll need to navigate through this project with ease:

- Take a peek at the live app right here: [Live Demo](https://joke-factory.heriyanto.dev)
- If you're ready to dive into the nitty-gritty, here's the API URL that's at the heart of it all: [API URL](https://joke-factory-server.fly.dev).
- For those curious minds who want to explore under the hood, here's the source code for the FrontEnd: [Joke-Factory-Client GitHub](https://github.com/HeriYantodotDev/joke-factory-client)

## Getting Started 

Within this repository, I have thoughtfully included a pair of essential environment variables for your convenience:

- .env.test
- .env.development

No need to worry about setting up a database for these two environments – the app will take care of it for you by automatically generating an SQLITE database.

This considerate inclusion empowers you to seamlessly initiate test and development operations without any preliminary configuration requirements. However, for staging and production environments, a preparatory step awaits: the establishment of dedicated databases for each respective setting.

### Running The test

- `npm install`
- `npm run test`


### Running The Server

- `npm install`
- `npm run dev`

## Current Status
Working In Progress

## Main Technologies Used
This project is built using the following technologies:
- TypeScript / JavaScript
- Node.js
- Express.js
- Sqlite3 (for test and development)
- PostgreSQL (for staging and production)
- Sequelize (Database ORM)
- Rest APIs

## Dependencies

### Production Dependencies

```
"dependencies": {
  "bcrypt": "^5.1.0",
  "connect-flash": "^0.1.1",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "express-session": "^1.17.3",
  "i18next": "^22.4.14",
  "i18next-fs-backend": "^2.1.5",
  "i18next-http-middleware": "^3.3.2",
  "joi": "^17.9.2",
  "jsonwebtoken": "^9.0.1",
  "multer": "^1.4.5-lts.1",
  "nodemailer": "^6.9.4",
  "npm": "^9.8.1",
  "passport": "^0.6.0",
  "passport-local": "^1.0.0",
  "pg": "^8.11.2",
  "reflect-metadata": "^0.1.13",
  "rimraf": "^5.0.1",
  "sequelize": "^6.32.1",
  "sequelize-cli": "^6.6.1",
  "winston": "^3.10.0"
}
```

### Development Dependencies

```
"devDependencies": {
  "@types/bcrypt": "^5.0.0",
  "@types/connect-flash": "^0.0.37",
  "@types/cors": "^2.8.13",
  "@types/express": "^4.17.17",
  "@types/express-session": "^1.17.7",
  "@types/jest": "^29.5.0",
  "@types/jsonwebtoken": "^9.0.2",
  "@types/multer": "^1.4.7",
  "@types/node": "^18.15.11",
  "@types/nodemailer": "^6.4.9",
  "@types/passport": "^1.0.12",
  "@types/passport-local": "^1.0.35",
  "@types/pg": "^8.10.2",
  "@types/smtp-server": "^3.5.7",
  "@types/supertest": "^2.0.12",
  "@typescript-eslint/eslint-plugin": "^5.58.0",
  "@typescript-eslint/parser": "^5.58.0",
  "eslint": "^8.38.0",
  "jest-watch-typeahead": "^2.2.2",
  "smtp-server": "^3.11.0",
  "sqlite3": "^5.1.6",
  "supertest": "^6.3.3",
  "ts-jest": "^29.1.0",
  "ts-mockito": "^2.6.1",
  "ts-node": "^10.9.1",
  "typescript": "^5.1.6"
},
```

## TDD Process

If you're interested with how I developed the app using TDD method. you can check the full documentation here: [TDD-Process.md](./src/__docs__/TDD-Process/README.md)


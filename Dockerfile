FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

CMD [ "npm", "run", "start" ]

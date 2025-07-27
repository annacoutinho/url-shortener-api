FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache bash

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN chmod -R 755 node_modules/.bin

RUN bash -c "npm run build"

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

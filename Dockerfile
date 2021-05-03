FROM node:14-alpine

WORKDIR /app

COPY . /app

RUN npm ci

EXPOSE 6070

CMD [ "node", "app.js" ]

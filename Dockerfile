FROM node:22-alpine

RUN mkdir -p /home/node/server/node_modules && chown -R node:node /home/node/server

WORKDIR /home/node/server

COPY package*.json ./

USER node

RUN npm install

COPY . .

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "server.js" ]
FROM node:18-alpine

RUN mkdir -p /app
WORKDIR /app
COPY . .

RUN npm cache clean --force
RUN npm i -g pnpm
RUN pnpm i --shamefully-hoist

EXPOSE 8080
ENTRYPOINT pnpm run start

# base image
FROM node:latest
COPY . app
WORKDIR app

ADD package.json /app
RUN npm install

ENV PATH app/node_modules/.bin:$PATH
ENV NODE_ENV=development

CMD npm start

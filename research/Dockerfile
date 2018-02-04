FROM node:latest

RUN mkdir /app
WORKDIR /app

ADD . /app

ADD package.json /app
RUN npm install

# Environment variables
ENV PATH /app/node_modules/.bin:$PATH

# start app
CMD npm start

# Image we want to build from
FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

define the command to run your
CMD [ "npm", "run", "http" ]

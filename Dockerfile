# pull the Node.js Docker image
FROM node:16-alpine

# create the directory inside the container
WORKDIR /usr/src/app

# copy the package.json files from local machine to the workdir in container
COPY . .

# run npm install in our local machine
RUN npm install
RUN npm run build

# copy the generated modules and all other files to the container
COPY . .

ENV NODE_ENV production

# our app is running on port 3000 within the container, so need to expose it
EXPOSE 8081

# the command that starts our app
CMD ["npm", "start"]

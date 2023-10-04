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
COPY cert.pem /etc/ssl/certificates/cert.pem
COPY chain.pem /etc/ssl/certificates/chain.pem
COPY fullchain.pem /etc/ssl/certificates/fullchain.pem
COPY privkey.pem /etc/ssl/certificates/privkey.pem

ENV NODE_ENV production

# our app is running on port 3000 within the container, so need to expose it
EXPOSE 5000

# the command that starts our app
CMD ["node", "./lib/index.js"]

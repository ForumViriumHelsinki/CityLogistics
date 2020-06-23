# Pull official base image
FROM node:13.3-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependencies files
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

# Build proyect
RUN yarn install

# Copy proyect
COPY . .

# Build proyect (Only deploy mode)
RUN yarn build
RUN yarn global add serve

# Start app (Debug mode)
#CMD ["yarn","start"]

# Start app (Deploy mode)
CMD ["serve", "-s", "build", "-l", "3000"]


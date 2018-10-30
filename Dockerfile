FROM node:8.9.1

WORKDIR /app

COPY package.json .
RUN npm install --quiet

COPY . .


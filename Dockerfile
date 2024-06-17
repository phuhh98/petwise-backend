# syntax=docker/dockerfile:1
FROM node:20-alpine

LABEL version="1.0"
LABEL description="petwise docker image"

RUN mkdir /server
WORKDIR /server

EXPOSE 3000
COPY . .
CMD ["npm", "start"]
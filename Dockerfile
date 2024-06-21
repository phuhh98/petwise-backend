# syntax=docker/dockerfile:1
# Need to have node_modules folder install first
# and update required files in this lib according to README.md
FROM node:20-alpine AS development

LABEL version="1.0"
LABEL description="petwise docker image"

ARG WORK_DIR=/usr/src/app

WORKDIR ${WORK_DIR}

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

##########
FROM node:20-alpine AS production

ARG MODIFIED_LIBS=modified_modules
ARG WORK_DIR=/usr/src/app

WORKDIR ${WORK_DIR}

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=development ${WORK_DIR}/dist ./dist

COPY ${MODIFIED_LIBS} ./node_modules

EXPOSE 3000

CMD ["node", "dist/main"]



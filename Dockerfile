FROM node:16-alpine

RUN apk update -qq \
  && apk add --no-cache bash curl \
  && rm -rf /var/cache/apk/*

RUN curl --compressed -o- -L https://yarnpkg.com/install.sh | bash \
  && npm install -g npm

WORKDIR /app

COPY ./app/package.json ./app/yarn.lock ./
RUN yarn install --non-interactive

COPY ./app ./

RUN yarn run build

EXPOSE 3000

CMD ["yarn", "dev"]

# Birthday Wishes Sender

## Installation

```bash
$ pnpm install

# copy the env
$ cp env.example .env
```

## Setup DB

```bash
# create a new database
$ sequelize db:create

# run the migrations
$ sequelize db:migrate
```

[Reference](https://sequelize.org/docs/v6/other-topics/migrations/)

## Running the app

```bash


# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
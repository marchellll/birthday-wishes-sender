# Birthday Wishes Sender

## System Design

See the [System Design](./docs/system_design.md) for the system design.

## Scope

This project implemented all the requirements of the project:
- `POST /user`
- `DELETE /user`
- `PUT /user`
- send email via `https://email-service.digitalenvision.com.au`
- The system needs to be able to recover and send all unsent messages if the service was down for a period of time (say a day).
  - All the scheduled message saved persistently in MySQL.
  - after down time, the service can query all the pending work
- Make sure your code is scalable
  - Adding NEW happy anniversary (or any other type of scheduled messages) is as easy as adding new rows to `scheduled_messages` table. And it will naturally works with the existing system.
- Make sure your code is testable
  - The code is well tested with unit tests and e2e tests.
  - The e2e only test the 2 endpoints
  - The unit tests cover 100% business logic, (wiring/configurations files are ignored)
- High scalability
  - Using queue to handle the email sending, and the queue can be easily replaced with a more scalable solution like RabbitMQ or Kafka.
  - The system is designed to be stateless, and can be easily scaled horizontally and vertically.
  - Vertically by adding more cpu, so it can handle more concurrent requests and sending email tasks processing
  - Horizontally by adding more instances of the service. The queue is centralized in redis right now, so the tasks are distributed evenly among the instances.



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
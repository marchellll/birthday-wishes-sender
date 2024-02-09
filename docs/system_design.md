# Birthday Wishes

This repo will send birthday wishes at 9am on their local time.

## System Design

### Sequence Diagrams

#### User Registration / Edit
On registration, the user's birthday is stored in the database and a birthday wish is scheduled to be sent at 9am on their birthday.

Similar thing happened when the user edit their birthday, we just adjust the next schedule time.

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Scheduler
    participant Worker
    participant Database
    participant Email

    User->> API: POST /user
    API->>DB: INSERT INTO users...

    API->> DB: INSERT INTO birthday_wishes (next_schedule_at, user_id) VALUES (...)

    API-->>User: 201 Created

```

#### Scheduler

Will run every 5 minutes to check if there are any birthday wishes to be sent. This way, it will be resilient. Even if the scheduler is down, the birthday wishes will be sent when the scheduler is up and running.

The scheduler main jon is only to query the recipients candidates then publish to Queue. It does not send the email. We cant do horizontal scaling if we send emails in the scheduler.

```mermaid
sequenceDiagram
    participant Scheduler
    participant Queue
    participant Database

    Scheduler->>Database: SELECT * FROM birthday_wishes WHERE next_schedule_at < now()
    Database-->>Scheduler: [user_id, next_schedule_at]

    Scheduler->>Queue: { user_id, next_schedule_at }
```

#### Worker

This is a long running background process that will listen to the Queue topic and send the birthday wishes. **We can scale this vertically/horizontally** to handle more birthday wishes. We cant do horizontal scaling with scheduler only.

We lock the user row in the database for **idempotency**. This way, if 2 workers are running, they will not send the same birthday wish twice.

```mermaid
sequenceDiagram
    participant Worker
    participant Queue
    participant Database
    participant Email

    Worker->>Queue: CONSUME
    Queue-->>Worker: { user_id }

    note right of Worker: create transaction
    Worker->>Database: SELECT * FROM users WHERE id = user_id FOR UPDATE
    Database-->>Worker: [user_id, email, names]

    Worker->>Worker: check if the birthday wish has been sent

    Worker->>Email: SEND

    Worker->>Database: UPDATE birthday_wishes SET next_schedule_at = next_schedule_at + 1 year WHERE user_id = user_id
    note right of Worker: transaction end

```
## Tech stacks

- Nest.js: just because it already has scheduler support.
- MySQL: any database that support row lock will do.
- Kafka/Redis : for the queue
- Docker: for the deployment.


## Deployment Plan

This is a simple application and can be deployed in a single server. We can use docker compose to deploy everything.
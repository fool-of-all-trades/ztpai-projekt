# StoryLine - Spring Boot + Angular School Version

The core idea is simple: every day has a literary quote of the day, users write stories inspired by that quote, and each published story must include the quote. Visitors can browse stories publicly, while logged-in users can publish and manage their own stories.

## Features

- Public dashboard with today's date, quote of the day, and story writing form.
- Public stories page with the quote for the day.
- Public story details.
- User registration and login.
- JWT-protected story publishing and story management.
- Story CRUD as the main entity for the school requirement.
- Backend validation that a story includes the daily quote.
- Backend validation that a user can publish only one story per prompt date.
- Backend application event published after story creation.
- Angular frontend consuming the Spring API.

## Tech Stack

Backend:

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Validation
- Spring Security
- JWT authentication
- BCrypt password hashing
- PostgreSQL
- Flyway
- Maven
- JUnit and Mockito

Frontend:

- Angular

Database and local tooling:

- Docker Compose
- PostgreSQL on port `5434`

## Requirements

- Java 21
- Maven
- Node.js and npm
- Angular CLI (`ng`)
- Docker Desktop or Docker Engine with Docker Compose

## How to Run the Project

### 1. Start Docker/PostgreSQL

From the repository root:

```bash
docker compose up -d
```

PostgreSQL is exposed locally at:

```text
localhost:5434
```

### 2. Start the Spring Backend

Backend folder:

```bash
cd spring-api
```

Run:

```bash
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### 3. Start the Angular Frontend

Frontend folder:

```bash
cd angular-client
```

Run:

```bash
ng serve
```

Frontend URL:

```text
http://localhost:4200/dashboard
```

## API Overview

Public endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/quotes`
- `GET /api/quotes/random`
- `GET /api/quotes/today`
- `GET /api/quote/today`
- `GET /api/stories`
- `GET /api/stories/{id}`

Authenticated endpoints:

- `GET /api/auth/me`
- `GET /api/stories/me`
- `POST /api/stories`
- `PUT /api/stories/{id}`
- `DELETE /api/stories/{id}`
- `GET /api/events/stories`

Story creation uses the current quote of the day on the backend. The client does not choose the quote.

## Tests

Important backend test areas:

- `StoryServiceTest` verifies story creation, ownership, quote inclusion, and duplicate daily story rules.
- `UserServiceTest` verifies registration/login behavior.
- `StoryEventListenerTest` verifies that the event listener reacts to story creation events.

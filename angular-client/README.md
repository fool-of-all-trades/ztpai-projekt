# Storyline School Client

Minimal Angular skeleton for the school Story CRUD project.

## Current Phase

Phase 9 completed:

- Angular application folder
- Strict TypeScript configuration
- Standalone app bootstrap
- Routing skeleton
- Placeholder page for events
- API base URL configuration
- Basic app shell and responsive styles
- Login form connected to `POST /api/auth/login`
- Register form connected to `POST /api/auth/register`
- `AuthService` with JWT access token stored only in memory
- Current-user state exposed from `AuthService`
- HTTP interceptor that attaches `Authorization: Bearer <token>`
- Logout action that clears in-memory auth state
- Story and quote API services
- Searchable story list
- Story detail page
- Create and edit story form with quote selection
- My Stories page with edit and delete actions

Event UI polish and demo checklist work are not implemented yet.

## Requirements

- Node.js
- npm
- Angular CLI through the project dependency

## Configuration

Development API base URL:

```ts
http://localhost:8080/api
```

Production API base URL:

```ts
/api
```

These values live in `src/environments`.

## Run Notes

From this folder, install dependencies first:

```bash
npm install
```

Then start the dev server:

```bash
npm start
```

The app should be available at:

```text
http://localhost:4200
```

These commands were not run during Phase 9 because they install or build project dependencies.

## Security Note

The auth implementation keeps the JWT access token in Angular memory only. It does not store credentials or JWTs in `localStorage` or `sessionStorage`.

This means the user must log in again after refreshing the browser. That is intentional for this simplified school project and avoids keeping credentials or tokens in browser storage.

## Next Phase

Phase 10 should polish the demo flow and README checklist, then run approved backend/frontend verification commands.

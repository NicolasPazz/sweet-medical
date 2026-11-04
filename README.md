# Sweet Medical

Web platform to book medical appointments, with health insurance coverage and cost calculation. Patients search and book appointments; doctors manage their availability, services and appointment history.

**Live demo:** https://sweet-medical-ui.netlify.app

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Axios |
| Backend | Node.js, Express, Swagger |
| Database | MongoDB (Mongoose) |
| Testing | Jest (unit and integration), Cypress (E2E) |
| CI/CD | GitHub Actions, Render (API), Netlify (frontend) |

## Features

**Appointments**
- Book, cancel and reschedule, with time-limit and state validations.
- Search by doctor, specialty, practice, location and date range.
- Coverage and estimated cost based on the patient's insurance plan (total, partial or not covered).
- Select several appointments at once before confirming (cart-style).

**Doctors**
- Define weekly availability; available slots are generated in background batches.
- Manage services (specialties and practices).
- Confirm appointments, mark them as done and view a patient's history.

**Notifications**
- Sent when an appointment is booked, confirmed, cancelled or changed.
- Automatic reminder the day before.
- Read / unread tracking.

## Structure

```
packages/
  backend/    REST API (Express)
  frontend/   UI (React + Vite)
  e2e/        End-to-end tests (Cypress)
```

## Run locally

```bash
npm install
cp packages/backend/.env.example packages/backend/.env   # set MONGODB_URI, etc.
npm run dev    # backend and frontend together
```

API docs (Swagger) are served at `http://localhost:3001/api-docs`.

## Tests

The backend tests need a MongoDB instance running as a replica set (the CI starts one with Docker).

```bash
npm run test:backend
npm run test:frontend
npm run test:e2e
```

GitHub Actions runs the integration and E2E tests on every push and pull request to `main`; Render and Netlify deploy automatically when `main` changes.

## Workflow

Git Flow: features branch off `develop` and are merged through reviewed pull requests; `develop` is merged into `main` at each milestone.

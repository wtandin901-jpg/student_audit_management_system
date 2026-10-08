# Student Audit Management System (Week 1–2)

A REST API backend for a college Student Audit Unit. The unit audits clubs, forums,
student units and hostels. This version covers **Week 1 (setup + database)** and
**Week 2 (users, authentication, roles, audited units, audits)**.

> **Not part of this version:** findings, status updates, notifications, dashboards,
> comments and exports are planned for later weeks and are **not implemented**.

## Features currently implemented
- Express server with JSON parsing, CORS, central error handling, `GET /api/health`
- PostgreSQL schema (`users`, `audited_units`, `audits`) with foreign keys and constraints
- Registration and login (bcrypt hashing, JWT)
- JWT authentication middleware and role-based access control (ADMIN, AUDITOR, REPRESENTATIVE)
- Admin user management (list users, change roles)
- Audited Units CRUD and Audits CRUD with validation and `?audited_unit_id=` filter

## Technology stack
Node.js, Express.js, PostgreSQL, `pg`, `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`, `nodemon`.
Plain JavaScript (CommonJS). Tested with Postman/curl. Git/GitHub for collaboration.

## Project structure
```
database/schema.sql        SQL for the tables
scripts/createAdmin.js     creates the first ADMIN
src/config/db.js           PostgreSQL connection pool
src/models/                SQL queries (one file per table)
src/controllers/           request handling + validation + business rules
src/routes/                URL -> controller mapping (+ middleware)
src/middleware/            authentication, roles, error handling
src/utils/validate.js      validation helpers
src/app.js                 Express app setup
src/server.js              starts DB check + server
```

## Prerequisites
Node.js 18+ (20+ recommended), PostgreSQL 14+, npm, Postman, Git.

## Installation
```bash
git clone <your-repo-url>
cd student-audit-management
npm install
```

## PostgreSQL setup
```bash
psql -U postgres -c "CREATE DATABASE student_audit_db;"
psql -U postgres -d student_audit_db -f database/schema.sql
```

## Environment variables
Copy `.env.example` to `.env` and fill it in.

| Variable | Meaning |
|---|---|
| PORT | API port (default 3000) |
| DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD | PostgreSQL connection |
| JWT_SECRET | long random secret used to sign tokens |
| JWT_EXPIRES_IN | token lifetime, e.g. `1d` |

## Creating the first admin
Public registration cannot create ADMIN accounts. Add `ADMIN_NAME`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD` to `.env`, run `npm run create-admin`, then **delete those three lines**.

## Running
```bash
npm run dev     # development (nodemon)
npm start       # normal
```
You should see `PostgreSQL connection SUCCESSFUL` and `Server running on http://localhost:3000`.

## API endpoints
| Method | URL | Who |
|---|---|---|
| GET | /api/health | public |
| POST | /api/auth/register | public (AUDITOR or REPRESENTATIVE only) |
| POST | /api/auth/login | public |
| GET | /api/auth/me | any logged-in user |
| GET | /api/users | ADMIN, AUDITOR |
| GET | /api/users/:id | ADMIN |
| PUT | /api/users/:id/role | ADMIN |
| POST | /api/audited-units | ADMIN, AUDITOR |
| GET | /api/audited-units | all roles (representative sees own unit only) |
| GET | /api/audited-units/:id | all roles (representative: own unit only) |
| PUT | /api/audited-units/:id | ADMIN, AUDITOR |
| DELETE | /api/audited-units/:id | ADMIN, AUDITOR |
| POST | /api/audits | ADMIN, AUDITOR |
| GET | /api/audits (`?audited_unit_id=1`) | all roles (representative: own unit's audits only) |
| GET | /api/audits/:id | all roles (representative: own unit's audits only) |
| PUT | /api/audits/:id | ADMIN, AUDITOR |
| DELETE | /api/audits/:id | ADMIN, AUDITOR |

Protected routes need the header `Authorization: Bearer <token>`.

## Postman testing
Create a Postman environment with `baseUrl = http://localhost:3000/api`. Test in this order:
health -> register auditor/representatives -> login -> copy token -> create unit ->
list units -> create audit -> list audits -> update -> delete. Test negative cases too
(no token, wrong role, invalid data).

## Current scope / planned for later weeks
Implemented: Weeks 1–2 above.
Planned later (NOT implemented): findings, finding assignment, status updates,
notifications, dashboard, exports.
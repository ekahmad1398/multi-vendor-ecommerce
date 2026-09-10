# E-Commerce Project

Simple Node.js, Express, MongoDB e-commerce API with JWT authentication, email OTPs, products, carts, and orders.

## Project Structure

- `client/`: Frontend application workspace.
- `server/`: Backend application workspace.
- `server/src/config/`: Application and environment configuration.
- `server/src/controllers/`: Request-handling layer.
- `server/src/middleware/`: Express middleware.
- `server/src/models/`: Mongoose data models.
- `server/src/routes/`: Express route definitions.
- `server/src/services/`: Application service layer.
- `server/src/utils/`: Shared backend utilities.
- `server/src/app.js`: Express application setup entry point.
- `server/server.js`: Backend process entry point.
- `server/.env`: Local environment variables; keep this file out of version control.
- `server/.gitignore`: Backend-specific ignored files.
- `server/package.json`: Backend package metadata and dependencies.
- `.gitignore`: Repository-wide ignored files.
- `README.md`: Project documentation.

## Setup

1. In `server`, copy `.env.example` to `.env` and fill in MongoDB, JWT, and Mailtrap values.
2. Run `npm install` and `npm run dev` from `server`.
3. Use `Authorization: Bearer <token>` for protected endpoints.

Public routes include `GET /api/products`, `GET /api/categories`, and the authentication routes under `/api/auth`. Product search supports `keyword`, `category`, `minPrice`, `maxPrice`, `page`, and `limit` query parameters. The first admin user must be set deliberately in MongoDB by changing its `role` to `admin`; public registration never creates an administrator.

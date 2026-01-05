# Attendify Setup Guide

This guide provides detailed instructions on how to set up and run Attendify, the Student Attendance Tracker.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database
- [Replit Account](https://replit.com/) (recommended for easy deployment and auth integration)

## Environment Variables & Secrets

To run this application, you need to configure several environment variables. On Replit, these should be added to the **Secrets** tab.

| Key | Description | Example |
|-----|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:password@host:port/db` |
| `SESSION_SECRET` | A long, random string used to encrypt sessions | `your_random_secret_here` |
| `REPL_ID` | (Automatically set by Replit) Unique ID of your Repl | `repl-id-123` |
| `ISSUER_URL` | OpenID Connect issuer URL | `https://replit.com/oidc` |

## Database Setup

1. **Connection**: Ensure your `DATABASE_URL` is correctly set in your environment variables.
2. **Schema Push**: Sync your database schema with Drizzle ORM:
   ```bash
   npm run db:push
   ```
   *Note: If the push fails due to structural changes, you may need to use `--force`.*

## Authentication

Attendify uses **Replit log in with Replit (OIDC)**.
- When running on Replit, authentication is handled automatically through the `javascript_log_in_with_replit` integration.
- Ensure the **Auth** integration is enabled in your Replit workspace.

## Installation & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   This starts both the Express backend and the Vite frontend on port 5000.

## Project Structure

- `client/`: React frontend (Vite, Tailwind, shadcn/ui)
- `server/`: Node.js Express backend
- `shared/`: Shared database schema and Zod types
- `shared/routes.ts`: Unified API route definitions

## Troubleshooting

- **Database Errors**: Ensure your PostgreSQL instance is running and reachable from your environment.
- **Unauthorized Errors**: Check if your session is active and that Replit Auth is correctly configured.
- **Port Conflicts**: The app defaults to port 5000. Ensure no other service is using this port.

---
*Built with React, Express, and Drizzle ORM.*

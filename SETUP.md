# Attendify Setup Guide

This guide provides a comprehensive, step-by-step walkthrough for setting up and running Attendify, the Student Attendance Tracker.

## Phase 1: Preparation

### 1. Replit Environment
- Go to [Replit](https://replit.com/) and create a new account if you don't have one.
- Open the project in your Replit workspace.

### 2. Required Tools
Ensure the following are available in your environment (Replit provides these by default):
- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)

## Phase 2: Configuration (Secrets & Environment Variables)

You must configure several keys for the application to function. In Replit, use the **Secrets** tool (lock icon in the sidebar).

### 1. Database URL
- You need a PostgreSQL database. Replit provides a built-in one.
- If using Replit's database, the `DATABASE_URL` is automatically added for you.
- If using an external database, add a secret:
  - **Key**: `DATABASE_URL`
  - **Value**: `postgres://user:password@host:port/db_name`

### 2. Session Secret
- This is used to secure user sessions.
- Add a secret:
  - **Key**: `SESSION_SECRET`
  - **Value**: A long, random string (e.g., `83b27ac...91f2`)

### 3. Replit Auth (OIDC)
- Ensure the **Auth** integration is active. 
- The following are handled automatically by Replit but listed for completeness:
  - `REPL_ID`: Your unique Repl identifier.
  - `ISSUER_URL`: Set to `https://replit.com/oidc`.

---

## 💡 Example: How to add Secrets

In Replit, you do **not** add secrets directly into the code files (like `server/index.ts`). Instead, you use the **Secrets Tool**.

### Step 1: Locate the Secrets Tool
Click the **lock icon** (Secrets) in the left-hand sidebar of your Replit editor.

### Step 2: Add your Secrets
Add the following key-value pairs exactly as shown:

| Key | Example Value | Why? |
|-----|---------------|------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_x123@ep-cool-water-123.us-east-2.aws.neon.tech/neondb?sslmode=require` | Connects the app to your database. |
| `SESSION_SECRET` | `df93j20fj392jf032jf032jf032jf032jf032jf032j` | Encrypts user login sessions for security. |

### Step 3: Verification
The code automatically reads these values using `process.env`. 

**Example of how the code uses them (DO NOT EDIT THESE FILES):**
- In `server/db.ts`: `const pool = new Pool({ connectionString: process.env.DATABASE_URL });`
- In `server/replit_integrations/auth/index.ts`: `secret: process.env.SESSION_SECRET`

---

## Phase 3: Installation & Initialization

### 1. Install Packages
Open the shell/terminal and run:
```bash
npm install
```

### 2. Initialize Database
Sync your code's data model with your PostgreSQL database:
```bash
npm run db:push
```
*If you see warnings about structure changes, you can safely proceed or use `npm run db:push -- --force`.*

## Phase 4: Launching the App

### 1. Start the Server
Run the following command:
```bash
npm run dev
```
- This will start the Express backend and Vite frontend simultaneously.
- The application will be accessible on port **5000**.

### 2. Accessing the UI
- Once the "Start application" workflow shows as running, click the **Webview** tab in Replit.
- You should see the login screen for Attendify.

## Phase 5: Usage Steps

1. **Login**: Click "Login with Replit" to create your account.
2. **Add Subjects**: Navigate to the "Subjects" page and add your courses (e.g., Math, Science). Pick a color for each.
3. **Set Timetable**: Go to the "Timetable" page. Add "Class Slots" for each subject by selecting the day and time.
4. **Generate Schedule**: On the Timetable page, click "Generate Schedule". Select a start date and the number of months (e.g., 3 months).
5. **Mark Attendance**: Your dashboard will now show today's classes. Mark them as "Present", "Absent", or "Cancelled".

## Troubleshooting Common Issues

- **Empty Dashboard**: Ensure you have clicked "Generate Schedule" after adding classes to your Timetable.
- **Database Connection Error**: Verify that `DATABASE_URL` is correct and your database server is active.
- **Notifications Not Appearing**: Ensure you have clicked "Enable Class Reminders" on the Dashboard and granted browser permissions.

---
*Developed by npm_sharma*

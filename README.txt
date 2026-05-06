Team Task Manager
A full-stack team task manager built for the assignment requirements: authentication, project/team management, task assignment, task status tracking, dashboard metrics, SQL database relationships, validation, and role-based access control.

Tech Stack
Node.js 24
Native HTTP REST API
Native SQLite database via node:sqlite
Vanilla HTML, CSS, and JavaScript frontend
No external npm dependencies are required.

Features
Signup and login with hashed passwords
JWT-style signed session tokens
Admin and Member account roles
Project creation and project-level membership
Project Admin and Member roles
Task creation, assignment, priority, due date, and status tracking
Dashboard totals for all tasks, status counts, and overdue tasks
REST API validation and SQL foreign-key relationships
Local Setup
npm start
Open http://localhost:3000.

The SQLite database is created automatically at data/team-task-manager.sqlite.

Railway Deployment
Push this folder to a GitHub repository.
Create a new Railway project from that repository.
Set these environment variables:
JWT_SECRET=replace-with-a-long-random-secret
DATABASE_PATH=/app/data/team-task-manager.sqlite
Add a Railway volume mounted at /app/data so the SQLite database persists across deploys.
Railway will run:
npm start
REST API
Auth
POST /api/auth/signup
POST /api/auth/login
GET /api/me
Users
GET /api/users
Projects
GET /api/projects
POST /api/projects
GET /api/projects/:id
POST /api/projects/:id/members
Tasks
GET /api/projects/:id/tasks
POST /api/projects/:id/tasks
PATCH /api/tasks/:id
Dashboard
GET /api/dashboard

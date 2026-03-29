# HRMS - Human Resource Management System

A full stack HRMS built with React, Node.js, Express, and MongoDB.

## Features
- JWT Authentication (Admin & Employee roles)
- Employee Management (Add, Edit, Delete + Profile Image)
- Attendance Tracking (Clock In / Clock Out)
- Leave Management (Apply, Approve, Reject)
- Dashboard with live stats

---

## Project Structure

```
hrms-project/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/         ← auto-created when you add employees
│   ├── .env             ← you create this (see below)
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── api.js
        └── App.jsx
```

---

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```
PORT=5000
MONGO_URI=mongodb+srv://yourname:yourpassword@cluster0.xxxxx.mongodb.net/hrmsdb?retryWrites=true&w=majority
JWT_SECRET=mysecretkey123
```

Also create an uploads folder:

```bash
mkdir uploads
```

Start the backend:

```bash
npm run dev
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000  
Backend runs on: http://localhost:5000

---

### 3. Create Your First Admin User

Use Postman or Thunder Client to call:

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@hrms.com",
  "password": "admin123",
  "role": "admin"
}
```

Then log in with those credentials from the browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/employees | Get all employees |
| POST | /api/employees | Add employee (admin) |
| PUT | /api/employees/:id | Update employee (admin) |
| DELETE | /api/employees/:id | Delete employee (admin) |
| POST | /api/attendance/clockin | Clock in |
| POST | /api/attendance/clockout | Clock out |
| GET | /api/attendance/all | All attendance (admin) |
| GET | /api/attendance/:empId | Employee attendance |
| POST | /api/leaves | Apply for leave |
| GET | /api/leaves/all | All leaves (admin) |
| PUT | /api/leaves/:id/status | Approve/Reject leave |
| GET | /api/dashboard/stats | Dashboard stats (admin) |

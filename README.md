# 🚀 HRMS - Human Resource Management System

A full-stack Human Resource Management System (HRMS) built using **React, Node.js, Express, and MongoDB** to streamline employee management, attendance tracking, leave workflows, and administrative operations.

---

## 🌐 Live Demo

👉 https://hrms1-ivory.vercel.app/

---

## 🔑 Demo Login Credentials

> Use these credentials to explore the application:

**Admin Login**

* Email: `admin@hrms.com`
* Password: `admin123`

---

## 🎥 Demo Video

👉 [Click here to watch the HRMS demo](https://drive.google.com/file/d/14aTCatCgXeKQhetjGQo3ko2hP3dl50Yr/view?usp=sharing)

---

## ✨ Features

### 🔐 Authentication

* JWT-based authentication
* Role-based access control (Admin & Employee)

### 👨‍💼 Employee Management

* Add, edit, and delete employees
* Upload profile images
* View detailed employee information

### 🕒 Attendance System

* Clock In / Clock Out functionality
* Track employee attendance records

### 📅 Leave Management

* Apply for leave
* Admin approval/rejection workflow
* Leave tracking system

### 📊 Dashboard

* Real-time statistics
* Employee insights and summaries

---

## 🛠 Tech Stack

* **Frontend:** React
* **Backend:** Node.js, Express
* **Database:** MongoDB Atlas
* **Authentication:** JSON Web Tokens (JWT)

---

## 📁 Project Structure

```
hrms-project/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env
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

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Create uploads folder:

```bash
mkdir uploads
```

Run backend:

```bash
npm run dev
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

* Frontend → http://localhost:3000
* Backend → http://localhost:5000

---

## 👤 Create Admin User (If running locally)

```http
POST /api/auth/register
```

```json
{
  "name": "Admin User",
  "email": "admin@hrms.com",
  "password": "admin123",
  "role": "admin"
}
```

---

## 📡 API Endpoints

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| POST   | /api/auth/register       | Register user        |
| POST   | /api/auth/login          | Login                |
| GET    | /api/employees           | Get all employees    |
| POST   | /api/employees           | Add employee         |
| PUT    | /api/employees/:id       | Update employee      |
| DELETE | /api/employees/:id       | Delete employee      |
| POST   | /api/attendance/clockin  | Clock in             |
| POST   | /api/attendance/clockout | Clock out            |
| GET    | /api/attendance/all      | All attendance       |
| GET    | /api/attendance/:empId   | Employee attendance  |
| POST   | /api/leaves              | Apply leave          |
| GET    | /api/leaves/all          | All leaves           |
| PUT    | /api/leaves/:id/status   | Approve/Reject leave |
| GET    | /api/dashboard/stats     | Dashboard stats      |

---

## 📦 Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 🧠 Key Highlights

* Full-stack MERN architecture
* Real-world HR workflows implementation
* Secure authentication using JWT
* Role-based authorization system
* RESTful API design
* Scalable and modular code structure

---

## 📬 Submission Checklist

* ✅ GitHub Repository with clean code
* ✅ Live deployed application
* ✅ README documentation
* ✅ Postman API collection
* ✅ Demo video

---

## 👨‍💻 Author

**Kishore R**
Final Year CSE Student

---

## ⭐ Conclusion

This project demonstrates the ability to build a complete full-stack application with real-world business logic, clean architecture, and scalable implementation.

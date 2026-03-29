# HRMS — Database schema & ER overview

MongoDB is used with Mongoose. Collections map one-to-one with model names below. This document satisfies the **database schema / ER diagram** deliverable; diagrams render on GitHub/GitLab.

---

## Entity relationship (Mermaid)

```mermaid
erDiagram
  User ||--o| Employee : links
  Employee ||--o{ Attendance : records
  Employee ||--o{ Leave : requests
  Employee ||--o{ Payroll : payslips
  Employee ||--o{ Performance : reviews
  Employee ||--o{ Expense : claims
  Employee ||--o{ ExitRequest : exits
  User ||--o{ Expense : approves

  Department {
    ObjectId _id PK
    string name
    string description
  }

  Designation {
    ObjectId _id PK
    string title
    string level
    string description
  }

  User {
    ObjectId _id PK
    string email UK
    string password
    string role
  }

  Employee {
    ObjectId _id PK
    ObjectId userId FK
    string name
    string email UK
    string department
    string designation
    ObjectId reportingTo FK
    string costCenter
    number salary
    object emergencyContact
    array skills
    array employmentHistory
    array documents
  }

  Attendance {
    ObjectId _id PK
    ObjectId employeeId FK
    string date
    string clockIn
    string clockOut
    object clockInLocation
    object clockOutLocation
    boolean isManual
    boolean isLate
    number workHours
  }

  Leave {
    ObjectId _id PK
    ObjectId employeeId FK
    string leaveType
    string startDate
    string endDate
    string status
    ObjectId approvedBy FK
  }

  Payroll {
    ObjectId _id PK
    ObjectId employeeId FK
    string month
    string year
    number grossSalary
    number netSalary
    string status
  }

  Performance {
    ObjectId _id PK
    ObjectId employeeId FK
    array goals
    object selfAssessment
    object managerReview
    array peerFeedback
    string status
  }

  Expense {
    ObjectId _id PK
    ObjectId employeeId FK
    number amount
    string status
    ObjectId approvedBy FK
  }

  Holiday {
    ObjectId _id PK
    string name
    string date
    string type
  }

  Recruitment {
    ObjectId _id PK
    string jobTitle
    string status
    array applicants
  }

  Training {
    ObjectId _id PK
    string title
    string status
  }

  ExitRequest {
    ObjectId _id PK
    ObjectId employeeId FK
    string lastWorkingDay
    string status
  }
```

---

## Design notes

- **Departments** and **designations** are separate collections for CRUD; **Employee** still stores `department` and `designation` as strings for fast display and legacy forms (you may normalize to `ObjectId` refs in a future migration).
- **Recruitment** embeds **applicants** as a subdocument array (not a separate collection).
- **User** links to **Employee** via `Employee.userId` for login/role and self-service.

---

## PDF / file artifacts

- Employee **profile images** and **documents**: files on disk under `backend/uploads/` with paths stored on the employee record.
- **Payslip** and **offer letter**: generated on the fly (PDF), not stored in MongoDB.

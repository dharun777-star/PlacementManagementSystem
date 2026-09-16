# Placement Management System - REST API Documentation

Complete REST API documentation for the **College Placement Management System** developed with **Django REST Framework (DRF)** and **SQLite**.

---

## 1. Base URL & Configuration

- **Local Base URL**: `http://127.0.0.1:8000/api`
- **Default Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`

---

## 2. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats/` | Aggregated dashboard metrics and department ratios |
| `GET` | `/api/students/` | List all students (supports `?search=`, `?department=`, `?placement_status=`) |
| `GET` | `/api/students/{id}/` | Retrieve single student by DB ID |
| `POST` | `/api/students/` | Create a new student profile |
| `PUT` / `PATCH` | `/api/students/{id}/` | Full or partial update of student profile |
| `DELETE` | `/api/students/{id}/` | Delete student and cascade cleanup |
| `GET` | `/api/companies/` | List all recruiting companies (supports `?search=`) |
| `GET` | `/api/companies/{id}/` | Retrieve company by DB ID |
| `POST` | `/api/companies/` | Add a new recruiting company drive |
| `PUT` / `PATCH` | `/api/companies/{id}/` | Update company information |
| `DELETE` | `/api/companies/{id}/` | Delete company record |
| `GET` | `/api/placements/` | List placements (supports `?search=`, `?company=`, `?status=`) |
| `GET` | `/api/placements/{id}/` | Retrieve placement record by DB ID |
| `POST` | `/api/placements/` | Create placement offer (auto-syncs student status to 'Placed') |
| `PUT` / `PATCH` | `/api/placements/{id}/` | Update placement record |
| `DELETE` | `/api/placements/{id}/` | Delete placement record (reverts student to 'Not Placed' if no other active offers) |

---

## 3. Student Endpoints

### 3.1 List Students
- **Request**: `GET /api/students/`
- **Query Parameters**:
  - `search` (optional): Case-insensitive match on name, student_id, department, or skills.
  - `department` (optional): Exact branch code (e.g. `CSE`, `IT`, `ECE`).
  - `placement_status` (optional): `Placed` or `Not Placed`.
- **Response** `200 OK`:
```json
[
  {
    "id": 1,
    "student_id": "STU202601",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@college.edu",
    "phone": "9876543210",
    "department": "CSE",
    "year": 4,
    "cgpa": "9.25",
    "skills": "Python, Django, React, Docker, Machine Learning",
    "placement_status": "Placed",
    "created_at": "2026-09-16T11:08:49.123456Z",
    "updated_at": "2026-09-16T11:08:49.123456Z"
  }
]
```

### 3.2 Create Student
- **Request**: `POST /api/students/`
- **Body**:
```json
{
  "student_id": "STU202609",
  "name": "Pooja Hegde",
  "email": "pooja.h@college.edu",
  "phone": "9876543220",
  "department": "IT",
  "year": 4,
  "cgpa": 9.10,
  "skills": "JavaScript, Node.js, Express, MongoDB",
  "placement_status": "Not Placed"
}
```
- **Response** `201 Created`: Returns the newly created student object.

### 3.3 Validation Errors
- **Duplicate ID or Email**: Returns `400 Bad Request` with:
```json
{
  "student_id": ["A student with this Student ID already exists."],
  "email": ["A student with this Email already exists."]
}
```
- **Invalid CGPA (> 10.0 or < 0.0)**:
```json
{
  "cgpa": ["CGPA must be between 0.00 and 10.00."]
}
```
- **Invalid Phone (< 10 digits)**:
```json
{
  "phone": ["Phone number must contain between 10 and 15 digits."]
}
```

---

## 4. Company Endpoints

### 4.1 List Companies
- **Request**: `GET /api/companies/`
- **Query Parameters**:
  - `search` (optional): Filter by company name, role, or location.
- **Response** `200 OK`:
```json
[
  {
    "id": 1,
    "company_id": "COMP101",
    "company_name": "Google India",
    "hr_name": "Meera Sundaram",
    "hr_email": "meera.s@google.com",
    "job_role": "Software Development Engineer",
    "package": "28.50",
    "location": "Bangalore",
    "required_skills": "Data Structures, Algorithms, System Design",
    "drive_date": "2026-10-15",
    "created_at": "2026-09-16T11:08:49.123456Z",
    "updated_at": "2026-09-16T11:08:49.123456Z"
  }
]
```

### 4.2 Create Company
- **Request**: `POST /api/companies/`
- **Body**:
```json
{
  "company_id": "COMP107",
  "company_name": "Atlassian",
  "hr_name": "Sanya Malhotra",
  "hr_email": "sanya.m@atlassian.com",
  "job_role": "Site Reliability Engineer",
  "package": 26.00,
  "location": "Bengaluru / Remote",
  "required_skills": "Linux, Python, Cloud Infrastructure, Docker",
  "drive_date": "2026-11-25"
}
```

---

## 5. Placement Endpoints

### 5.1 Create Placement Offer
- **Request**: `POST /api/placements/`
- **Body**:
```json
{
  "placement_id": "PLC010",
  "student": 5,
  "company": 3,
  "job_role": "Data Scientist",
  "package": 19.50,
  "placement_date": "2026-09-16",
  "status": "Selected"
}
```
- **Response** `201 Created`:
```json
{
  "id": 6,
  "placement_id": "PLC010",
  "student": 5,
  "company": 3,
  "student_name": "Vikram Verma",
  "student_roll": "STU202605",
  "company_name": "Amazon Web Services",
  "job_role": "Data Scientist",
  "package": "19.50",
  "placement_date": "2026-09-16",
  "status": "Selected"
}
```
*Note: Student 5's `placement_status` is automatically updated to `"Placed"` in SQLite.*

### 5.2 Delete Placement
- **Request**: `DELETE /api/placements/{id}/`
- **Response** `204 No Content`:
*Note: If this was the student's only offer, their status automatically reverts back to `"Not Placed"`.*

---

## 6. Dashboard Statistics Endpoint

- **Request**: `GET /api/dashboard/stats/`
- **Response** `200 OK`:
```json
{
  "total_students": 8,
  "total_companies": 5,
  "placed_students": 5,
  "not_placed_students": 3,
  "total_placements": 5,
  "placement_rate": 62.5,
  "avg_package": 17.4,
  "highest_package": 28.5,
  "dept_breakdown": [
    { "department": "AIDS", "total": 1, "placed": 1 },
    { "department": "CSE", "total": 2, "placed": 2 },
    { "department": "ECE", "total": 1, "placed": 0 },
    { "department": "EEE", "total": 1, "placed": 0 },
    { "department": "IT", "total": 2, "placed": 2 },
    { "department": "MECH", "total": 1, "placed": 0 }
  ],
  "top_companies": [
    { "company__company_name": "Google India", "hires": 1 },
    { "company__company_name": "Microsoft", "hires": 1 }
  ],
  "recent_placements": [...]
}
```

---

## 7. How to Test in Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Select `postman/Placement_Management_System.postman_collection.json`.
4. Ensure the environment variable `baseUrl` is set to `http://127.0.0.1:8000/api`.
5. Execute requests across Dashboard, Students, Companies, and Placements folders.

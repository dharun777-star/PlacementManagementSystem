# PlacementHub - College Placement Management System

A full-stack, responsive, and robust **Placement Management System** built for colleges and universities to manage students, recruiting companies, placement drives, and job offers.

---

## 🚀 Key Features

1. **Student Management (CRUD)**:
   - Roll/Student ID (Unique), Full Name, Email (Unique), Phone, Department, Year, CGPA (0.00-10.00), Skills, Placement Status.
   - Search by name, department, roll ID, or skill.
   - Client-side & server-side validation against duplicate IDs/Emails.

2. **Company Management (CRUD)**:
   - Company ID (Unique), Name, HR Contact, Email, Job Role, Package (LPA > 0), Location, Drive Date, Required Skills.
   - Search by company name, role, or location.

3. **Placement Drive Management (CRUD)**:
   - Links Students & Companies with Role, Package, Date, and Status (Selected, Offered, Joined, Pending).
   - **Automated Consistency**: Creating a placement offer automatically changes student status to **Placed**. Deleting a placement safely reverts status to **Not Placed** if no other active offer remains.
   - Filter by company and status.

4. **Interactive Dashboard**:
   - Live metrics: Total Students, Total Companies, Placed Count, Not Placed Count, Placement Success Rate %, Highest & Average Packages.
   - Visual department-wise placement progress bars.
   - Recent recruitment activities & top hiring partners list.

5. **Viva & Oral Exam Guide**:
   - Built-in reference tab and documentation explaining architectural decisions, relational schemas, REST APIs, and common questions.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Modern responsive system with CSS custom properties), Vanilla JavaScript (ES6+ async/await, modular components).
- **Backend**: Python 3.13, Django 6.1, Django REST Framework (DRF) 3.18.
- **Database**: SQLite3 (Relational DB with foreign keys and unique constraints).
- **API Testing**: Postman Collection (v2.1 included).

---

## 📁 Project Structure

```
├── backend/
│   ├── manage.py                          # Django management CLI
│   ├── db.sqlite3                         # SQLite Database
│   ├── placement_project/                 # Project configuration
│   │   ├── settings.py                    # DRF, CORS, static/template configs
│   │   ├── urls.py                        # Root routes & Frontend view
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── placements_app/                    # Core placement application
│       ├── models.py                      # Student, Company, Placement models
│       ├── serializers.py                 # DRF ModelSerializers with validators
│       ├── views.py                       # ViewSets & DashboardStatsView
│       ├── urls.py                        # API route routers
│       ├── admin.py                       # Django Admin configuration
│       ├── tests.py                       # Automated test suite (15 tests)
│       └── management/commands/
│           └── seed_data.py               # One-click sample college data seeder
├── frontend/
│   ├── index.html                         # SPA dashboard layout & modals
│   ├── css/
│   │   └── style.css                      # Modern, responsive styling
│   └── js/
│       ├── api.js                         # Central REST fetch client & error handler
│       ├── app.js                         # SPA controller, toasts, modals & analytics
│       ├── students.js                    # Student CRUD & search
│       ├── companies.js                   # Company CRUD & search
│       └── placements.js                  # Placement CRUD & auto-sync
├── postman/
│   ├── Placement_Management_System.postman_collection.json # Exportable Postman collection
│   └── API_DOCUMENTATION.md               # Complete REST API reference
├── requirements.txt                       # Project dependencies
└── README.md                              # This documentation
```

---

## ⚡ Step-by-Step Setup & Running Guide

### 1. Prerequisites
- Python 3.10+ installed on your machine.

### 2. Activate Virtual Environment (or install dependencies)
From the project root:
```bash
# If using the existing .venv:
.\.venv\Scripts\activate   # Windows PowerShell / CMD
# or source .venv/bin/activate (Linux/Mac)

# Install required packages:
pip install -r requirements.txt
```

### 3. Run Database Migrations
```bash
cd backend
python manage.py makemigrations placements_app
python manage.py migrate
```

### 4. Seed Realistic Sample Data (Recommended for Viva)
Populate 8 realistic students, 5 reputed companies (Google, Microsoft, Amazon, TCS, Infosys), and 5 placements with a single command:
```bash
python manage.py seed_data
```

### 5. Run Automated Tests
Verify all 15 unit tests across CRUD endpoints and validation rules:
```bash
python manage.py test placements_app
```

### 6. Start the Development Server
```bash
python manage.py runserver
```

Open your browser and visit:
👉 **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

## 📡 REST API Summary

| Endpoint | Methods | Description |
|---|---|---|
| `/api/dashboard/stats/` | `GET` | Aggregated dashboard numbers & department ratios |
| `/api/students/` | `GET`, `POST` | List all students / Add student |
| `/api/students/{id}/` | `GET`, `PUT`, `PATCH`, `DELETE` | Read / Update / Delete student |
| `/api/companies/` | `GET`, `POST` | List companies / Add company drive |
| `/api/companies/{id}/` | `GET`, `PUT`, `PATCH`, `DELETE` | Read / Update / Delete company |
| `/api/placements/` | `GET`, `POST` | List placements / Record offer |
| `/api/placements/{id}/` | `GET`, `PUT`, `PATCH`, `DELETE` | Read / Update / Delete placement |

---

## 🎓 Viva & Interview Preparation Guide

### Q1: What is the architectural pattern used in this system?
**Answer**: It uses a decoupled **Client-Server Architecture**. The backend provides stateless RESTful APIs using Django REST Framework (DRF) and manages relational persistence in SQLite. The frontend is a Single Page Application (SPA) communicating asynchronously via the `Fetch` API and JSON payloads.

### Q2: How does the system handle database constraints and data integrity?
**Answer**:
1. **Primary Keys & Foreign Keys**: `Placement` has foreign keys to `Student` and `Company` with `on_delete=models.CASCADE`.
2. **Uniqueness**: `student_id`, `email`, and `company_id` have `unique=True` constraints at the DB level, backed by custom validation in DRF serializers.
3. **Range Checks**: `cgpa` is validated between 0.00 and 10.00, and `package` must be strictly positive.

### Q3: How is student placement status automatically synchronized?
**Answer**: In `placements_app/models.py`, `Placement.save()` checks if status is `Selected`, `Offered`, or `Joined`, and automatically updates `student.placement_status = 'Placed'`. Similarly, `Placement.delete()` checks if any remaining active placements exist for that student; if not, it automatically sets the student back to `'Not Placed'`.

### Q4: Why use SQLite?
**Answer**: SQLite is serverless, lightweight, zero-configuration, and ACID-compliant. It stores data locally in `db.sqlite3`, making the application easily portable and executable on any evaluation computer without requiring database services like MySQL or Postgres.

---

## 🧪 Postman Collection
Import `postman/Placement_Management_System.postman_collection.json` into Postman to test every endpoint with pre-configured requests and schemas.

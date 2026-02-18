# 🏫 Smart Campus Maintenance System

**A robust, role-based facility management solution designed to streamline maintenance operations in educational institutions.**

![Project Status](https://img.shields.io/badge/status-in_development-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech Stack](https://img.shields.io/badge/stack-React%20|%20Spring%20Boot%20|%20MySQL-green)

## 🧠 Core Concept

The **Smart Campus Maintenance System** transforms how universities handle facility issues. Instead of manual complaints, it offers a digital workflow where:

1.  **Students** report issues (broken lights, leaks, WiFi down).
2.  **Admins** validate and prioritize tickets.
3.  **The System** automatically assigns the best available crew member (using a **C++ Optimization Engine**).
4.  **Maintenance Crew** updates progress in real-time via mobile.
5.  **Analytics** track performance and infrastructure health.

---

## 🏗 System Architecture

- **Frontend:** React.js (Student Portal, Admin Dashboard, Crew Dashboard)
- **Backend:** Java Spring Boot (REST API, Authentication, Ticket Lifecycle)
- **Database:** MySQL (Users, Tickets, Assignments, Logs)
- **Optimization:** C++ (JNI) for assignment algorithms and image compression.
- **DevOps:** Docker containers for easy deployment.

---

## ✨ Key Features by Role

### 🎓 **Student Portal**

- **Ticket Creation:** Select category (Water, Electricity, Internet, HVAC).
- **Media Upload:** Attach photos of the issue.
- **Location Mapping:** Pinpoint exact location (Building/Floor).
- **Live Tracking:** Watch status change: _Submitted → Approved → Assigned → In Progress → Resolved_.

### 👨‍💼 **Admin Dashboard**

- **Ticket Validation:** Approve or reject incoming requests.
- **Priority Management:** Set urgency (Low, Medium, High, Critical).
- **Analytics:** View resolution times, most common issues, and crew efficiency.
- **Manual Override:** Re-assign tasks if necessary.

### 🛠 **Maintenance Crew Dashboard**

- **Task List:** View assigned jobs with urgency levels.
- **Status Updates:** Mark tasks as "In Progress" or "Completed".
- **Proof of Work:** Upload "After" photos upon resolution.

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js (v18+)
- Java JDK 17+ & Maven
- MySQL Server

### 1. Clone the Repository

```bash
git clone [https://github.com/Duke-Dz/campus-maintenance-system.git](https://github.com/Duke-Dz/campus-maintenance-system.git)
cd campus-maintenance-system

2. Database Setup
Bash

# Log into MySQL and run the schema scripts
mysql -u root -p < database/schemas/schema.sql
mysql -u root -p < database/seed_data.sql
3. Backend Setup (Spring Boot)
Bash

cd backend
# IMPORTANT: Edit src/main/resources/application.properties with your DB password!
mvn clean install
mvn spring-boot:run
4. Frontend Setup (React)
Bash

cd frontend
npm install
npm run dev
📅 Project Roadmap (3 Months)
Month 1: Foundation
[x] Requirements gathering & System Design (ERD, UML).

[ ] Database implementation (MySQL).

[ ] Basic Authentication (Login/Register with JWT).

[ ] Backend API skeleton.

Month 2: Core Features
[ ] Ticket Lifecycle (CRUD operations).

[ ] Automatic Assignment Logic (Java/C++).

[ ] Admin & Student Dashboards (UI).

[ ] Role-based Access Control (RBAC).

Month 3: Polish & Optimization
[ ] Analytics Dashboard (Charts.js).

[ ] C++ Optimization Module integration.

[ ] Testing (Unit & Integration).

[ ] Final Documentation & Deployment.

👥 Team Structure (8 Members)
Role	Members	Responsibilities
Frontend	2	Student Portal, Admin/Crew Dashboards, UI/UX.
Backend API	2	Java REST API, Authentication, Endpoints.
Logic & DB	2	Database Design, Workload Balancing Algorithm.
Testing/Sec	1	Input Validation, Security Audits, Bug Testing.
DevOps/Docs	1	Deployment, ER Diagrams, Documentation.
```

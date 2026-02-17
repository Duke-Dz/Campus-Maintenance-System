# 🛠️ Developer Setup Guide

Follow these steps to get the **Smart Campus Maintenance System** running on your local machine.

## 📋 1. Prerequisites

- **Java JDK 17+**
- **Node.js 18+**
- **MySQL Server 8.0**
- **Maven** (usually included with IntelliJ/Eclipse)

## 🗄️ 2. Database Setup

1.  Open your terminal/command prompt.
2.  Login to MySQL:
    ```bash
    mysql -u root -p
    ```
3.  Run the schema scripts (ensure you are in the project root folder):
    ```sql
    source database/schemas/schema.sql;
    source database/seed_data.sql;
    ```
4.  Check if users exist:
    ```sql
    USE campus_maintenance_db;
    SELECT * FROM users;
    ```

## ☕ 3. Backend Setup (Spring Boot)

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  **CRITICAL:** Open `src/main/resources/application.properties` and update the database password:
    ```properties
    spring.datasource.password=YOUR_REAL_PASSWORD
    ```
3.  Install dependencies:
    ```bash
    mvn clean install
    ```
4.  Run the server:
    ```bash
    mvn spring-boot:run
    ```
    _Server will start at `http://localhost:8080`_

## ⚛️ 4. Frontend Setup (React)

1.  Open a **new** terminal window (leave the backend running).
2.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the app:
    ```bash
    npm start
    ```
    _App will open at `http://localhost:3000`_

## 🐳 Optional: Docker Run

If you have Docker installed, you can skip the above and run:

```bash
docker-compose up --build
```

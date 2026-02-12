# 🏗 System Architecture

The **Smart Campus Maintenance System** follows a **3-Tier Architecture** pattern to ensure separation of concerns, scalability, and maintainability.

## 1. High-Level Diagram

```mermaid
graph TD
    Client[Client Layer<br/>(React Frontend)] -->|REST API / JSON| Server[Server Layer<br/>(Spring Boot Backend)]
    Server -->|JPA / Hibernate| Database[(Database Layer<br/>MySQL)]
    Server -.->|JNI| CPP[Optimization Engine<br/>(C++ Logic)]

    subgraph Frontend
    Student[Student Portal]
    Admin[Admin Dashboard]
    Crew[Crew Mobile View]
    end

    subgraph Backend
    Auth[Auth Service]
    Ticket[Ticket Service]
    Assign[Assignment Algo]
    end

    Student --> Client
    Admin --> Client
    Crew --> Client

    Server --> Auth
    Server --> Ticket
    Server --> Assign
2. Component Breakdown
🖥️ Client Layer (Frontend)
Technology: React.js, Tailwind CSS, Axios, Context API.

Responsibility: Handles user interaction, form validation, and state management.

Key Modules:

Student Portal: Ticket submission forms with image drag-and-drop.

Admin Dashboard: Kanban-style board for ticket management and charts for analytics.

Maintenance Dashboard: Mobile-responsive task lists for field crews.

⚙️ Server Layer (Backend)
Technology: Java Spring Boot 3.2, Spring Security.

Responsibility: Business logic, data validation, and API endpoints.

Key Modules:

Security Controller: Handles JWT generation and validation (Stateless).

Ticket Service: Manages the lifecycle of a request (Open -> Assigned -> Closed).

Scheduler: Periodically checks for high-priority unassigned tickets.

JNI Bridge: Connects Java to the C++ Optimization Engine.

💾 Database Layer
Technology: MySQL 8.0.

Responsibility: Persistent storage of users, tickets, assignments, and audit logs.

Structure: Relational schema (3NF) ensuring data integrity with Foreign Keys.

⚡ Optimization Layer (C++)
Technology: C++ 17, JNI (Java Native Interface).

Responsibility:

Assignment Algorithm: Uses a weighted heuristic (distance + availability + skill) to auto-assign tickets.

Image Compression: Compresses uploaded evidence photos to save server storage space before saving to disk.

3. Data Flow Scenarios
🅰️ Scenario A: Student Submits a Ticket
User fills out the form and uploads a photo on the Frontend.

Frontend compresses the image (client-side) and sends a POST /api/tickets request with the JWT token.

Backend (Security) validates the JWT signature.

Backend (Controller) receives the DTO (Data Transfer Object).

Backend (Service) invokes the C++ Engine via JNI to further optimize the image (optional).

Backend (Repository) saves the Ticket entity to the MySQL database.

Database returns the generated ticket_id.

Backend returns 201 Created to the Frontend.

🅱️ Scenario B: Automatic Crew Assignment
Admin clicks "Auto-Assign" on the dashboard.

Backend fetches all OPEN tickets and all AVAILABLE crew members from the Database.

Backend passes this data arrays to the C++ Optimization Engine.

C++ Engine runs a matching algorithm (e.g., Greedy or Hungarian Algorithm).

C++ Engine returns pairs: {ticket_id: 101, crew_id: 5}.

Backend updates the database records to ASSIGNED and links the crew member.

4. Security Architecture
Authentication: JSON Web Tokens (JWT). No session state is stored on the server.

Authorization: Role-Based Access Control (RBAC).

ROLE_STUDENT: Can only view their own tickets.

ROLE_CREW: Can view assigned tickets and update status.

ROLE_ADMIN: Full access to all endpoints.

Data Protection:

Passwords hashed using BCrypt.

SQL Injection prevention via JPA/Hibernate parameterized queries.

CORS configured to allow requests only from the Frontend domain.

5. Deployment Architecture (DevOps)
The application is containerized using Docker for consistency across development and production environments.

Container 1 (Backend): Runs the Spring Boot JAR file (Exposed on Port 8080).

Container 2 (Frontend): Runs Nginx serving the React build (Exposed on Port 3000/80).

Container 3 (Database): MySQL Server with persistent volume storage (Internal Port 3306).
```

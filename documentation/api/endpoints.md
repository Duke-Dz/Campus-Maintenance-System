# 🔌 API Endpoints Documentation

Base URL: `http://localhost:8080/api/v1`

## 🔐 Authentication

| Method | Endpoint         | Description                 | Access |
| :----- | :--------------- | :-------------------------- | :----- |
| POST   | `/auth/register` | Register a new student      | Public |
| POST   | `/auth/login`    | Login and receive JWT token | Public |

## 🎫 Tickets

| Method | Endpoint               | Description                             | Access     |
| :----- | :--------------------- | :-------------------------------------- | :--------- |
| POST   | `/tickets`             | Create a new ticket (with image)        | Student    |
| GET    | `/tickets`             | Get all tickets (filtered by user role) | All        |
| GET    | `/tickets/{id}`        | Get specific ticket details             | All        |
| PUT    | `/tickets/{id}/status` | Update status (e.g., IN_PROGRESS)       | Crew/Admin |
| DELETE | `/tickets/{id}`        | Delete a ticket (Soft delete)           | Admin      |

## 🛠 Admin & Assignment

| Method | Endpoint                   | Description                       | Access |
| :----- | :------------------------- | :-------------------------------- | :----- |
| PUT    | `/admin/assign/{ticketId}` | Manually assign crew member       | Admin  |
| POST   | `/admin/auto-assign`       | Trigger C++ Auto-Assignment       | Admin  |
| GET    | `/admin/crew-load`         | View workload of all crew members | Admin  |

## 📊 Analytics

| Method | Endpoint                 | Description                        | Access |
| :----- | :----------------------- | :--------------------------------- | :----- |
| GET    | `/analytics/dashboard`   | Get summary stats (Open vs Closed) | Admin  |
| GET    | `/analytics/performance` | Get crew efficiency reports        | Admin  |

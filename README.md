Permit Tracking Application

A modern, government‑style permit tracking application built with:

    Backend: Java 17 + Spring Boot 3 + PostgreSQL (permit-api)

    Frontend: Angular 19 + Bootstrap + Cypress (permit-ui)

⚠️ **Current Status:**  
The frontend and backend are **currently disjointed projects**.  
I am in the process of **updating the Angular UI to connect with the Spring Boot API**.  
For now, the frontend uses mock data (Faker), and the backend can run independently for API testing.


This project demonstrates:

    RESTful backend with request validation, logging, and integration tests

    Angular 19 frontend with responsive Bootstrap UI and Cypress end‑to‑end tests

    Local‑first architecture, cloud‑ready for AWS ECS + RDS deployment

## Repository Structure

```
permit-tracking-app/
 ├─ permit-api-app/       # Spring Boot backend
 │   ├─ src/
 │   ├─ scripts/          # Local setup scripts (Postgres, H2)
 │   └─ README.md         # Backend-specific guide
 │
 ├─ permit-ui/            # Angular 19 frontend
 │   ├─ src/
 │   ├─ e2e/              # Cypress tests
 │   └─ README.md         # Frontend-specific guide
 │
 └─ README.md             # This file
``` 

## Backend (Spring Boot)
Setup and Run

cd permit-api-app

# 1. Setup local PostgreSQL
./scripts/setup-postgres-mac.sh      # macOS

# 2. Build and verify
./scripts/build-backend.sh

# 3. Run backend
./mvnw spring-boot:run

Backend runs at: http://localhost:8080

## Frontend (Angular 19)
Setup and Run

cd permit-ui

# 1. Install dependencies
npm install

# 2. Start local dev server
npm start

Frontend runs at: http://localhost:4200
Running Tests
Backend Tests

# Unit tests
./mvnw test

# Integration tests (includes MockMvc and filter ITs)
./mvnw verify -Pintegration

    Unit tests verify RequestSizeFilter logic in isolation

    Integration tests confirm full Spring wiring and error handling


Tech Highlights

    Security‑First Backend

        RequestSizeFilter blocks oversized or malformed requests

        Full coverage with unit + integration tests

    Modular Angular Frontend

        Responsive UI with Bootstrap

        Cypress e2e tests for critical flows

    Portfolio‑Ready Practices

        Clear separation of backend and frontend

        Local setup scripts for PostgreSQL and H2

        Demo‑driven development with CI‑friendly test suites

Next Steps
    
    Configure Angular to point to the deployed backend via environment.prod.ts

    Add CI/CD pipelines to automate testing and deployment

    Deploy backend to AWS ECS + RDS and frontend to S3 + CloudFront

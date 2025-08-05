# Permit Tracking Application

A modern, federal government‑style permit tracking application built with:

    Backend: Java 17 + Spring Boot 3 + PostgreSQL (permit-api)

    Frontend: Angular 19 + Bootstrap + Cypress (permit-ui)

⚠️ **Current Status:**  
The frontend and backend are **currently disjointed projects**.  
I am in the process of **updating the Angular UI to connect with the Spring Boot API**.  
For now, the frontend uses mock data (Faker), and the backend can run independently for API testing.

## Project Highlights
This project demonstrates:

    RESTful backend with request validation, logging, and integration tests

    Angular 19 frontend with responsive Bootstrap UI and Cypress end‑to‑end tests

    Local‑first architecture, cloud‑ready for AWS ECS + RDS deployment

## Repository Structure

```
permit-tracking-app/
 ├─ permit-api-app/       # Spring Boot backend
 │   ├─ src/
 │   └─ scripts/          # Local setup scripts (Postgres, H2)
 │
 ├─ permit-ui/            # Angular 19 frontend
 │   ├─ src/
 │   └─ e2e/              # Cypress tests
 │
 └─ README.md             # This file
``` 

## Backend (Spring Boot)
### Setup and Run Backend
```
cd permit-api-app

# 1. Setup local PostgreSQL
./scripts/setup-postgres-mac.sh      # macOS

# 2. Install homebrew and maven
./scripts/install_mvn_mac.sh      # macOS

# 2. Build and verify
./scripts/verify.sh

# 3. Run backend
./scripts/run_backend.sh
```
### Running Backend Tests

#### Unit tests
./scripts/test.sh

#### Integration tests (includes MockMvc and ITs)
./scripts/verify.sh

Backend runs at: http://localhost:8080

## Frontend (Angular 19)
### Setup and Run

```cd permit-ui```

#### 1. Install dependencies
```npm install```

#### 2. Generate Mock DB Data
```npm run generate```
Note: This data is viewable/editable in ./server/database.json

#### 3. Start local Mock DB Server
```npm run faker```

#### 3. Start local dev server
```ng serve```

Faker server runs at: http://localhost:3000
Frontend runs at: http://localhost:4200

### Running Tests

#### Unit tests (Karma)
```ng test```

#### Integration tests (Cypress)
```ng e2e```

Note: Faker server must be running for Cypress Intergation Tests

## Tech Highlights

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

## Next Steps
    
    Change Angular to conform to Permit model object

    Integrate OWASP dependency Check

    Add CI/CD pipelines to automate testing and deployment

    Deploy backend to AWS ECS + RDS and frontend to S3 + CloudFront

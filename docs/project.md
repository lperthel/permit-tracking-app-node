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
## Environment Variables Setup

This project uses a .env file to manage sensitive configuration such as database credentials and active Spring profiles. All provided shell scripts automatically load these variables, so you do not need to export them manually if the .env file exists.

### 1. Configure Your Environment File

Locate the sample file in the project root:

```.env.example```

Open it and update the values for your environment:
```
PERMIT_DB_NAME=permitdb
PERMIT_DB_USER=permituser
PERMIT_DB_PASS=LrnkwpW7g*nFq.M@9kHG
PERMIT_DB_HOST=localhost
PERMIT_DB_PORT=5432

Required    Variables:
Variable	  Description
PERMIT_DB_HOST	    PostgreSQL hostname
PERMIT_DB_PORT	    PostgreSQL port (usually 5432)
PERMIT_DB_NAME	    Database name
PERMIT_DB_USER	    Database username
PERMIT_DB_PASSWORD	Database password
```
Rename the file to .env:

```mv .env.example .env```

### 2. Automatic Variable Loading

All provided shell scripts (./scripts/start.sh, ./scripts/setup_db.sh, etc.) automatically load variables from .env.

No manual export is required if you are using the included scripts.

To verify that your environment is correctly loaded:

```./scripts/check_env.sh```

(Optional script: prints all loaded variables for debugging.)

### 3. Changing Variables Later

If you change any variable in .env:

  Save the file.
  
  Re‑run your shell script. The updated values will be loaded automatically.

## Frontend (Angular 19)
### Setup and Run

```cd permit-ui```

#### 1. Install dependencies
```npm install```

#### 2. Generate Mock DB Data
```npm run generate```

Note: This data is viewable/editable in ```./server/database.json```

#### 3. Start local Mock DB Server
```npm run faker```

Faker server runs at: ```http://localhost:3000```

#### 3. Start local dev server
```ng serve```

Frontend runs at: ```http://localhost:4200```

### Running Tests

#### Unit tests (Karma)
```ng test```

#### Integration tests (Cypress)
```ng e2e```

Note: Faker server must be running for Cypress Intergation and E2E Tests

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
Backend runs at: http://localhost:8080

### Running Backend Tests

#### Unit tests
```./scripts/test.sh```

#### Integration tests (includes MockMvc and ITs)
```./scripts/verify.sh```

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

See project Page: https://github.com/users/lperthel/projects/1/views/1

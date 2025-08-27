# Permit API - Backend Codebase Guide for Claude

## 📋 Project Overview

This is the backend API for a **permit tracking system** - currently a Java Spring Boot application that needs to be **converted to Node.js**. The system provides RESTful APIs for permit CRUD operations with validation, error handling, and database persistence.

### Current Status & Migration Goal

- **Current Stack**: Java 17 + Spring Boot 3 + PostgreSQL
- **Target Stack**: Node.js + Express/Fastify + TypeScript + PostgreSQL
- **Migration Priority**: Convert Java backend to Node.js while maintaining API compatibility with Angular frontend

### Key Migration Challenge

⚠️ **Model Mismatch**: The current backend and frontend models are NOT aligned:

#### Backend Model (Java - Current)
```java
// PermitEntity.java
UUID id;                    // UUID type
String permitName;          // max 100 chars
String applicantName;       // max 100 chars  
String permitType;          // max 50 chars
PermitStatus status;        // Enum
LocalDateTime submittedDate; // Timestamp field
```

#### Frontend Model (Angular - TypeScript)
```typescript
// permit.model.ts
interface Permit {
  id: string;              // String representation of UUID
  permitName: string;      // max 100 chars
  applicantName: string;   // max 100 chars
  permitType: string;      // max 50 chars
  status: PermitStatus;    // Enum
  // NOTE: Missing submittedDate field!
}
```

### Model Alignment Requirements

1. **Frontend is missing `submittedDate`** - Need to add this field to Angular models
2. **Validation patterns differ slightly** - Backend allows periods in validation regex, frontend includes commas
3. **UUID handling** - Backend uses UUID type, frontend uses string representation
4. **Date format** - Need to ensure consistent ISO 8601 format between systems

## 🏗️ Current Java Architecture

### Project Structure

```
permit-api-app/
├── src/main/java/com/permittrack/permitapi/
│   ├── PermitApiApplication.java           # Main Spring Boot app
│   ├── config/
│   │   └── RequestSizeFilter.java          # Security: Request size limiter
│   ├── controller/
│   │   ├── GlobalExceptionHandler.java     # Centralized error handling
│   │   ├── HealthController.java           # Health check endpoint
│   │   └── PermitController.java           # Main CRUD endpoints
│   ├── model/
│   │   ├── PermitEntity.java              # JPA entity
│   │   ├── PermitRequestDTO.java          # Input validation DTO
│   │   ├── PermitResponseDTO.java         # Output DTO
│   │   ├── PermitStatus.java              # Status enum
│   │   └── ResourceNotFoundException.java  # Custom exception
│   ├── repository/
│   │   └── PermitRepository.java          # JPA repository
│   ├── service/
│   │   └── PermitService.java             # Business logic
│   └── support/
│       ├── PermitJsonPath.java            # JSON path constants
│       └── PermitMapper.java              # Entity-DTO mapper
├── src/test/                               # Comprehensive test suite
├── scripts/                                # Setup and run scripts
└── pom.xml                                 # Maven dependencies
```

### API Endpoints

```http
GET    /api/permits          # Get all permits
GET    /api/permits/{id}     # Get permit by ID
POST   /api/permits          # Create new permit
PUT    /api/permits/{id}     # Update permit
DELETE /api/permits/{id}     # Delete permit
GET    /health               # Health check
```

### Validation Rules (Backend)

```java
// PermitRequestDTO.java validation
permitName:     Required, max 100 chars, pattern: ^[a-zA-Z0-9 \-.\']+$
applicantName:  Required, max 100 chars, pattern: ^[a-zA-Z0-9 \-.\']+$
permitType:     Required, max 50 chars,  pattern: ^[a-zA-Z0-9 \-.\']+$
status:         Required, must be valid enum value
```

### Database Schema

```sql
CREATE TABLE permits (
    id UUID PRIMARY KEY,
    permit_name VARCHAR(100) NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    permit_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    submitted_date TIMESTAMP NOT NULL
);
```

## 🚀 Target Node.js Architecture

### Recommended Stack

```
Node.js + TypeScript
├── Framework: Express or Fastify
├── ORM: Prisma or TypeORM
├── Validation: Joi or Zod
├── Testing: Jest + Supertest
├── Database: PostgreSQL (same as current)
└── Documentation: OpenAPI/Swagger
```

### Proposed Project Structure

```
permit-api-node/
├── src/
│   ├── controllers/
│   │   ├── permit.controller.ts
│   │   └── health.controller.ts
│   ├── models/
│   │   ├── permit.model.ts
│   │   └── permit.dto.ts
│   ├── services/
│   │   └── permit.service.ts
│   ├── repositories/
│   │   └── permit.repository.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── request-size.middleware.ts
│   ├── config/
│   │   └── database.config.ts
│   ├── types/
│   │   └── permit.types.ts
│   └── app.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

### Migration Strategy

#### Phase 1: Setup Node.js Project
1. Initialize Node.js project with TypeScript
2. Setup Express/Fastify framework
3. Configure PostgreSQL connection
4. Setup development environment

#### Phase 2: Implement Core Models
1. Define TypeScript interfaces matching Java DTOs
2. Setup ORM models (Prisma/TypeORM)
3. Implement validation schemas
4. Ensure model compatibility with frontend

#### Phase 3: Implement API Endpoints
1. Create permit controller with CRUD operations
2. Implement service layer business logic
3. Add repository layer for database operations
4. Setup error handling middleware

#### Phase 4: Add Security & Validation
1. Implement request size limiting middleware
2. Add input validation middleware
3. Setup CORS configuration
4. Add rate limiting

#### Phase 5: Testing & Integration
1. Write unit tests for services
2. Write integration tests for endpoints
3. Test with existing Angular frontend
4. Ensure API compatibility

## 🔧 Development Workflow

### Current Java Commands

```bash
# Database setup
./scripts/setup_postgres_mac.sh

# Build and test
./scripts/verify.sh      # Run all tests
./scripts/test.sh        # Unit tests only

# Run application
./scripts/run_backend.sh # Start Spring Boot app
```

### Environment Variables

```env
# Current .env structure
PERMIT_DB_NAME=permitdb
PERMIT_DB_USER=permituser
PERMIT_DB_PASS=LrnkwpW7g*nFq.M@9kHG
PERMIT_DB_HOST=localhost
PERMIT_DB_PORT=5432
```

### Testing Requirements

The current Java application has comprehensive test coverage:
- Unit tests for all services and DTOs
- Integration tests for controllers
- Repository tests with H2 and PostgreSQL
- Request filter tests

**Node.js implementation must maintain similar test coverage.**

## 🎯 Critical Migration Considerations

### 1. API Compatibility

The Node.js API must be **100% compatible** with the existing Angular frontend:
- Same endpoint paths
- Same request/response formats
- Same validation rules
- Same error response structure

### 2. Model Alignment Tasks

Before or during migration:
1. **Add `submittedDate` to frontend models**
2. **Align validation patterns** between frontend and backend
3. **Standardize date format** (recommend ISO 8601)
4. **Document UUID string format** for consistency

### 3. Database Migration

- Maintain existing PostgreSQL schema
- Use migrations for any schema changes
- Ensure UUID compatibility in Node.js ORM
- Preserve existing data during transition

### 4. Testing Strategy

- Port all existing Java tests to Jest/Supertest
- Maintain same test categories (unit, integration)
- Use test containers for PostgreSQL tests
- Ensure CI/CD compatibility

### 5. Performance Considerations

- Request size limiting (currently 10KB max)
- Connection pooling for PostgreSQL
- Proper async/await handling
- Error handling without memory leaks

## 📝 Implementation Checklist

### Initial Setup
- [ ] Initialize Node.js project with TypeScript
- [ ] Setup package.json with scripts
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Setup ESLint and Prettier
- [ ] Create project structure

### Core Implementation
- [ ] Define TypeScript models and DTOs
- [ ] Setup database connection (Prisma/TypeORM)
- [ ] Implement permit controller
- [ ] Implement permit service
- [ ] Implement permit repository
- [ ] Add validation middleware
- [ ] Add error handling middleware
- [ ] Add request size limiter

### Testing
- [ ] Setup Jest configuration
- [ ] Write unit tests for services
- [ ] Write integration tests for controllers
- [ ] Setup test database
- [ ] Add test fixtures
- [ ] Achieve >80% code coverage

### Integration
- [ ] Test with Angular frontend
- [ ] Update frontend models if needed
- [ ] Update API documentation
- [ ] Setup Docker configuration
- [ ] Create migration guide

### Deployment Preparation
- [ ] Setup environment variables
- [ ] Create production build process
- [ ] Setup logging
- [ ] Add health check endpoint
- [ ] Create deployment scripts

## 🔗 Related Documentation

- **Frontend Guide**: `../permit-ui/CLAUDE.md`
- **Main README**: `../README.md`
- **API Collection**: `./postman/permit-api.postman_collection.json`

## 💡 Key Decisions to Make

1. **Framework Choice**: Express vs Fastify vs NestJS
2. **ORM Choice**: Prisma vs TypeORM vs Sequelize
3. **Validation Library**: Joi vs Zod vs class-validator
4. **Testing Framework**: Jest vs Mocha vs Vitest
5. **Migration Timeline**: Big bang vs gradual migration

## 🚦 Success Criteria

The Node.js migration is successful when:
1. All API endpoints work identically to Java version
2. Angular frontend works without modifications
3. All tests pass with >80% coverage
4. Performance is equal or better than Java version
5. Development workflow is documented and smooth

---

This guide provides comprehensive context for converting the Java Spring Boot backend to Node.js while maintaining compatibility with the existing Angular frontend and addressing the model alignment issues.
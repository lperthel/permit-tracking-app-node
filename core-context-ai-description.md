# Permit Tracking App - Sprint Context for Claude

## 📊 Current Status
- **Frontend**: Angular 19 (95% complete) with Bootstrap UI + Cypress E2E tests ✅
- **Backend**: Spring Boot 3.x (partially complete, needs Sprint 1-3 modifications) 🔄
- **Integration**: Components work independently, requires CORS + API alignment
- **Project Board**: https://github.com/users/lperthel/projects/1

## 🏃‍♂️ Current Sprint 1: First Demoable API
**Goal**: Ship GET /api/permits endpoint with integration tests + Swagger UI

**Active Issues**:
- **Issue #1**: Project Bootstrap & Core Structure [CURRENT FOCUS]
- **Issue #2**: Database Schema & Flyway Setup  
- **Issue #3**: Permit Entity & Repository Layer
- **Issue #4**: GET /api/permits Endpoint with DTOs
- **Issue #17**: Swagger/OpenAPI Documentation Setup

**Deliverable**: Working GET /api/permits via Postman + interactive Swagger UI

## 🛠️ Tech Stack
**Frontend**: Angular 19, TypeScript, Bootstrap 5, Cypress  
**Backend**: Java 17, Spring Boot 3.x, PostgreSQL, JPA, Flyway  
**Testing**: Integration tests required per endpoint, JaCoCo coverage >90%  
**Docs**: Swagger UI, Postman collections  
**Future**: AWS ECS + RDS deployment

## 🏛️ Government-Ready Standards
- **Security-First**: Input validation, CORS, no sensitive data in logs
- **FISMA-Minded**: Stable tech stack, comprehensive testing, audit trails
- **DTO Pattern**: Never expose entities directly, always use Data Transfer Objects
- **Error Handling**: @ControllerAdvice global exceptions, generic error messages
- **Integration Testing**: Every API endpoint requires working integration test

## 🎯 What I Need From You
- **Technical guidance** on Spring Boot architecture and government patterns
- **Code review** for enterprise/government compliance standards  
- **Push me to ship** - call out overthinking, focus on concrete next steps
- **Sprint-focused advice** - help me complete Issue #1, then move to #2, etc.
- **Challenge decisions** when I'm choosing suboptimal approaches

## 🔄 Development Approach
- **Demo-driven**: Every sprint ends with something testable via Postman/browser
- **Local-first**: Get working locally before any cloud deployment
- **Small iterations**: Complete issues #1-4 before moving to Sprint 2
- **Integration testing**: Build fails if any test fails (Surefire + Failsafe)

## 📋 Current Sprint Workflow
**Sprint 1 Progress**: Working through Issues #1-4 sequentially  
**Next Sprint**: Sprint 2 (POST/PUT/DELETE endpoints) after Sprint 1 demo complete  
**Board Updates**: I'll tell you when issues move between columns or get completed

> **Reference**: Full project timeline and detailed requirements in separate documentation. This core context focuses on current Sprint 1 work.
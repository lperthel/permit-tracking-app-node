# Documentation Guide - Permit Tracking App

**Last Updated**: 2025-08-24

## Overview
This guide explains the purpose and usage of all .md files in the permit tracking application.

## Documentation Structure

### 1. Project-Level Documentation

#### **README.md** (Root)
- **Purpose**: Main project overview and setup instructions
- **Audience**: New developers, portfolio viewers
- **Content**: Tech stack, setup steps, project status
- **Note**: Currently duplicates docs/project.md (should consolidate)

#### **docs/project.md**
- **Purpose**: Duplicate of README.md
- **Status**: Should be removed or differentiated from README.md
- **Recommendation**: Delete and use README.md as single source

### 2. Development Documentation

#### **permit-ui/CLAUDE.md**
- **Purpose**: Knowledge base for Claude AI sessions
- **Content**: 
  - Established patterns (UiActions, ApiActions, ApiIntercepts, UiAssertions)
  - Anti-patterns to avoid
  - Domain model
  - Test structure
  - Project conventions
- **Usage**: Reference this when starting new Claude sessions

#### **permit-ui/agents/**
- **code-reviewer.md**: Agent configuration for code pattern enforcement
- **qa-expert.md**: Agent configuration for test strategy and GitHub issues
- **angular-architect.md**: (Not currently used)

### 3. Issue Tracking

#### **permit-ui/issue22.md**
- **Purpose**: Current sprint issue documentation
- **Status**: ACTIVE - Updated with agent-based testing approach
- **Content**: 
  - Current work status
  - Code review findings
  - Acceptance criteria
  - Next steps

#### **docs/issue generation context.md**
- **Purpose**: Template for creating new GitHub issues
- **Content**: Format and required sections for issues
- **Usage**: Reference when creating new sprint issues

### 4. Test Documentation

#### **permit-ui/code-review-results.md**
- **Purpose**: Output from code-reviewer agent
- **Status**: NEW - Created 2025-08-24
- **Content**:
  - Pattern violations found
  - Test redundancy analysis
  - Improvement recommendations
  - Code quality metrics

#### **docs/test-coverage-analysis-doc.md**
- **Purpose**: Historical test coverage analysis
- **Content**: Previous coverage gaps and recommendations
- **Status**: May be outdated after recent improvements

### 5. Process Documentation

#### **sprint-workflow-documentation.md**
- **Purpose**: Sprint process and workflow
- **Content**: How sprints are organized and executed

#### **definition-of-done-checklist.md**
- **Purpose**: Completion criteria for issues
- **Content**: Standard checklist for issue completion

### 6. Debug Documentation

#### **DEBUG_GUIDE.md**
- **Purpose**: Active debugging instructions
- **Content**: How to debug the application

#### **DEPRICATED_DEBUG_GUIDE.md**
- **Purpose**: Old debugging guide (deprecated)
- **Status**: Should be deleted

#### **core-context-ai-description.md**
- **Purpose**: AI-generated project context
- **Status**: May be outdated

## Recommended Actions

### Immediate Cleanup
1. **Delete duplicate**: Remove `docs/project.md` (duplicate of README.md)
2. **Delete deprecated**: Remove `DEPRICATED_DEBUG_GUIDE.md`
3. **Archive outdated**: Move `core-context-ai-description.md` to archive if not needed

### Documentation Updates Needed
1. **README.md**: Ensure it's the single source of truth for project overview
2. **test-coverage-analysis-doc.md**: Update with current coverage status
3. **sprint-workflow-documentation.md**: Verify it reflects current process

### Active Working Documents
- **issue22.md**: Current sprint work (keep updated)
- **CLAUDE.md**: Project patterns reference (maintain as patterns evolve)
- **code-review-results.md**: Latest code review findings (reference for fixes)
- **agents/*.md**: Agent configurations (update as needed)

## Usage Guidelines

### When Starting New Work
1. Read `issue22.md` for current sprint goals
2. Reference `CLAUDE.md` for established patterns
3. Check `code-review-results.md` for pending fixes

### When Running Agents
1. Use `code-reviewer.md` for pattern enforcement
2. Use `qa-expert.md` for coverage analysis
3. Save outputs to appropriate .md files

### When Creating Issues
1. Reference `docs/issue generation context.md` for format
2. Update relevant issue .md files with progress

### When Onboarding
1. Start with `README.md`
2. Read `CLAUDE.md` for project conventions
3. Review `DEBUG_GUIDE.md` for troubleshooting
# Sprint-Based AI Workflow Documentation

## 🎯 Workflow Overview

This document defines the workflow for managing AI conversations and project updates across sprint cycles for the Permit Tracking Application development.

**Core Principle**: One AI conversation per sprint to maintain technical context while enabling focused sprint execution.

---

## 📋 Conversation Structure

### **One Conversation Per Sprint**
- **Sprint 1**: Issues #1-4 + #17 (First Demoable API)
- **Sprint 2**: Issues #5-7 + #18-19 (Complete CRUD Operations)  
- **Sprint 3**: Issues #8-9 (Frontend-Backend Integration)
- **Sprint 4**: Issues #15-16 (UI Polish & Compliance)

### **Why Sprint-Based vs. Issue-Based**
✅ **Technical continuity** - architectural decisions carry forward within sprint  
✅ **Integration context** - issues within sprint are highly interconnected  
✅ **Sprint demo preparation** - full sprint context needed for deliverable  
✅ **Reduced context switching** - 4 conversations vs. 16+ conversations  

---

## 🔄 Between Sprint Conversations Workflow

### **End of Sprint Checklist**

#### 1. Update GitHub Project Board
- [ ] Move all completed issues to "🚀 Sprint Complete" column
- [ ] Move any incomplete issues to next sprint or backlog
- [ ] Update issue status and add completion notes
- [ ] Close completed milestone in GitHub

#### 2. Update Project README
- [ ] Update "Current Status" section with sprint completion
- [ ] Mark completed phase/sprint as ✅ 
- [ ] Update "Project Completion Timeline" progress
- [ ] Add any new learnings or architectural decisions

#### 3. Create Sprint Summary Document
Save in project as `sprint-X-summary.md`:
```markdown
# Sprint X Summary

## Completed Issues
- Issue #X: [Title] - [Key learnings/decisions]
- Issue #Y: [Title] - [Key learnings/decisions]

## Sprint Demo Results
- **Deliverable**: [What was demoed]
- **Stakeholder Feedback**: [Any feedback received]
- **Technical Achievements**: [Key milestones reached]

## Blockers/Challenges Encountered
- [Technical challenge] - [How resolved]
- [Architectural decision] - [Rationale]

## Lessons Learned
- [Key insight 1]
- [Key insight 2]

## Handoff to Next Sprint
- **Ready for Next Sprint**: [Issues ready to start]
- **Dependencies**: [Any blockers for next sprint]
- **Technical Debt**: [Items to address later]
```

#### 4. Prepare Next Sprint Context
Create brief status for next AI conversation:
```markdown
# Sprint X+1 Status Update

## Previous Sprint Results
- **Completed**: Sprint X ✅ - [brief description of deliverable]
- **Demo Status**: [working/needs fixes/blocked]
- **Technical Stack Status**: [any new dependencies/changes]

## Current Sprint Goals
- **Sprint X+1**: [sprint name and goal]
- **Priority Issues**: [list in order]
- **Expected Deliverable**: [what should be demoable at end]

## Project Board Status
- **Backlog**: [# issues]
- **Current Sprint**: [# issues]
- **In Progress**: [current work]
- **Blockers**: [any impediments]

## Technical Context Needed
- [Any architectural decisions from previous sprint]
- [New dependencies or configuration changes]
- [Integration points or API changes]
```

---

## 🚀 Starting New Sprint Conversation

### **Conversation Initialization Template**

**Subject/Title**: `Sprint X: [Sprint Name] - [Brief Goal]`

**Opening Message**:
```
Starting Sprint X: [Sprint Name]

[Paste sprint status update from preparation above]

## AI Context Needed
- Sprint focus: [primary goals]
- Technical decisions needed: [architectural choices]
- Code review areas: [government compliance, security, etc.]
- Demo preparation: [what needs to be working by sprint end]

Ready to dive into Issue #X: [First Issue Name]?
```

### **Include Core Project Context**
Always include the shortened core context (381 words) at start of sprint conversation for AI reference.

---

## 📊 Project Maintenance Schedule

### **Weekly During Sprint**
- [ ] Update project board as issues move through workflow
- [ ] Commit code with clear issue references (`git commit -m "Issue #X: implementation description"`)
- [ ] Update issue descriptions with progress notes

### **End of Each Sprint**
- [ ] Complete "End of Sprint Checklist" above
- [ ] Create demo video/screenshots for portfolio
- [ ] Update stakeholder documentation if needed
- [ ] Prepare next sprint conversation context

### **Monthly Project Health Check**
- [ ] Review overall timeline and adjust if needed
- [ ] Update comprehensive project documentation
- [ ] Assess if workflow changes needed
- [ ] Plan upcoming phase priorities

---

## 🛠️ Tools and Resources

### **GitHub Project Management**
- **Project Board**: https://github.com/users/lperthel/projects/1
- **Milestones**: One per sprint with due dates
- **Labels**: Sprint + phase for organization
- **Issues**: Detailed acceptance criteria and definition of done

### **Documentation Locations**
- **Core AI Context**: `/docs/ai-context-core.md` (381 words, use for each sprint)
- **Sprint Summaries**: `/docs/sprint-summaries/` (one file per sprint)
- **Architecture Decisions**: `/docs/architecture-decisions.md` (major technical choices)

### **Demo and Portfolio Materials**
- **Screenshots**: `/docs/demo-materials/sprint-X-screenshots/`
- **Demo Videos**: `/docs/demo-materials/sprint-X-videos/`
- **Postman Collections**: `/docs/api-testing/` (export after each sprint)

---

## ⚠️ Common Pitfalls to Avoid

### **Context Loss Between Sprints**
- **Solution**: Always include architectural decisions in sprint summary
- **Solution**: Reference previous sprint technical choices in new conversation

### **Scope Creep Within Sprint**
- **Solution**: Stick to planned sprint issues, add new ideas to backlog
- **Solution**: Have AI challenge scope additions during sprint

### **Demo Preparation Gaps**
- **Solution**: Ensure every sprint ends with working, testable deliverable
- **Solution**: Test demo scenarios before ending sprint conversation

### **Documentation Lag**
- **Solution**: Update README and project board immediately after sprint completion
- **Solution**: Create sprint summary while context is fresh

---

## 🎯 Success Metrics

### **Workflow Effectiveness**
- [ ] Each sprint conversation stays focused on sprint goals
- [ ] Technical decisions carry forward appropriately between sprints
- [ ] Project documentation stays current and accurate
- [ ] Demo deliverables are consistently achieved

### **Project Management Quality**
- [ ] GitHub project board reflects actual development status
- [ ] Sprint summaries provide clear progress narrative
- [ ] Stakeholders can understand project status from documentation
- [ ] No major scope or timeline surprises between sprints

### **AI Collaboration Quality**
- [ ] AI conversations stay productive and technically focused
- [ ] Architectural guidance is consistent across sprints
- [ ] Code review and standards enforcement remains effective
- [ ] Sprint goals are achieved with AI guidance

---

> **Note**: This workflow documentation should be updated based on experience and evolving project needs. Treat it as a living document that improves with each sprint cycle.
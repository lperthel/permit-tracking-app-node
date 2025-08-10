# Angular Test Debugging Guide

This guide explains how to debug Angular unit tests using VS Code's integrated debugger. Each configuration is designed for specific debugging scenarios in a government-grade development environment.

## 🚀 Quick Setup

**Verify Karma is working**:
   ```bash
   ng test
   ```

## 🎯 Debug Configurations Explained

### 1. Debug Angular Tests (All) - Production Validation

**When to use:**
- Pre-commit validation
- CI pipeline testing locally
- Generating coverage reports for compliance
- Portfolio demos to stakeholders

**What it does:**
- Runs **entire test suite** once and exits
- Generates **code coverage reports** in `coverage/` folder
- Uses **headless Chrome** for speed and CI compatibility
- **No watch mode** - perfect for scripted environments

**How to use:**
1. Set breakpoints in any test file (click red dot in gutter)
2. Press `F5` → Select "Debug Angular Tests (All)"
3. Tests run once, coverage report generated
4. Execution pauses at breakpoints for inspection

**Pro tip**: Use this before pushing to ensure your tests pass and meet coverage requirements.

---

### 2. Debug Angular Tests (Watch Mode) - TDD Development

**When to use:**
- Test-Driven Development workflow
- Active feature development
- Continuous feedback during coding

**What it does:**
- Runs tests and **stays running**
- **Auto-reruns tests** when you save files
- **Immediate feedback** on code changes
- Headless execution for performance

**How to use:**
1. Set breakpoints in test files
2. Press `F5` → Select "Debug Angular Tests (Watch Mode)"
3. **Make changes** to service or test files
4. **Save file** → tests automatically re-run
5. Execution pauses at breakpoints on each run

**TDD Workflow:**
```
1. Write failing test → Save → See red
2. Implement feature → Save → See green
3. Refactor → Save → Ensure still green
```

---

### 3. Debug Specific Test File - Focused Testing

**When to use:**
- Debugging a single service or component
- Isolating test failures
- Working on specific functionality

**What it does:**
- Runs **only tests matching the pattern** (currently `**/*permit.service.spec.ts`)
- **Single run** with focused output
- **Faster execution** by skipping unrelated tests

**How to customize:**
```json
// In launch.json, modify the --include pattern:
"--include", "**/*component.spec.ts"     // All component tests
"--include", "**/services/**/*.spec.ts"  // All service tests  
"--include", "**/*permit*.spec.ts"       // All permit-related tests
```

**How to use:**
1. **Modify the pattern** if needed
2. Set breakpoints in your target test file
3. Press `F5` → Select "Debug Specific Test File"
4. Only matching tests execute

---

### 4. Debug Tests with Chrome DevTools - Visual Debugging

**When to use:**
- Debugging complex DOM interactions
- Inspecting HTTP requests/responses
- Visual component testing
- Network debugging

**What it does:**
- Opens **real Chrome browser** (not headless)
- **Watch mode** keeps browser open
- Access to **full Chrome DevTools** (F12)
- **Visual inspection** of test results

**Chrome DevTools Features:**
- **Sources tab**: Set breakpoints, step through code
- **Network tab**: Inspect HTTP requests/responses
- **Console tab**: View logs, execute code
- **Elements tab**: Inspect DOM changes during tests

**How to use:**
1. Set breakpoints in VS Code
2. Press `F5` → Select "Debug Tests with Chrome DevTools"  
3. Chrome opens and runs tests
4. **Press F12** in Chrome for DevTools
5. **Use both VS Code AND Chrome** debugging simultaneously

**Pro tip**: Perfect for debugging HttpClientTestingModule requests and component rendering.

---

### 5. Debug Single Test (Manual) - Granular Control

**When to use:**
- Debugging one specific test case
- Karma configuration troubleshooting
- Custom test scenarios

**What it does:**
- **Direct Karma execution** (bypasses Angular CLI)
- Uses **grep pattern** to run specific tests
- **Maximum control** over test execution

**How to customize:**
```json
// In launch.json, modify the --grep pattern:
"--grep=should be created"           // Exact test description
"--grep=should.*create"             // Pattern matching
"--grep=PermitService.*fetch"       // Service-specific tests
```

**How to use:**
1. **Find the exact test description** you want to debug
2. **Update the --grep pattern** in launch.json
3. Set breakpoints
4. Press `F5` → Select "Debug Single Test (Manual)"
5. Only that specific test runs

---

## 🔧 Debugging Workflow

### Setting Breakpoints
```typescript
describe('PermitService', () => {
  it('should fetch all permits', () => {
    // Click here in gutter → Red dot appears
    service.requestAllPermits.subscribe((permits) => {
      expect(permits.length).toBe(2); // ← Set breakpoint here
      expect(permits).toEqual(mockPermits);
    });
  });
});
```

### Debug Controls
- **F5**: Continue execution
- **F10**: Step Over (next line in current function)
- **F11**: Step Into (enter function calls)
- **Shift+F11**: Step Out (exit current function)
- **Ctrl+Shift+F5**: Restart debugger

### Variable Inspection
- **Hover**: Mouse over variables to see current values
- **Variables panel**: View all local/global variables
- **Watch panel**: Monitor specific expressions
- **Debug console**: Execute code in current context

## 📊 Coverage Reports

When using "Debug Angular Tests (All)", coverage reports are generated in:
```
coverage/
├── lcov-report/index.html  ← Open this in browser
├── lcov.info               ← For CI tools
└── clover.xml             ← For Jenkins/SonarQube
```

## 🚨 Troubleshooting

### Tests Not Starting
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Breakpoints Not Hit
- Ensure you're using TypeScript source maps
- Check that `sourceMap: true` in `tsconfig.json`
- Restart VS Code after config changes

### Chrome Won't Open
```bash
# Install Chrome if missing
# Ubuntu: sudo apt install google-chrome-stable
# macOS: brew install --cask google-chrome
```

### Specific Test Not Running
- Verify test description matches `--grep` pattern exactly
- Check for typos in test names
- Ensure test file is included in `tsconfig.spec.json`

## 💡 Government Development Tips

### Security Testing
Use "Debug Tests with Chrome DevTools" to:
- Inspect request headers for security tokens
- Verify CORS handling
- Check for data sanitization

### CI/CD Integration
"Debug Angular Tests (All)" configuration matches:
- Jenkins pipeline execution
- GitHub Actions workflows
- Government deployment standards

### Code Quality Assurance
- Use coverage reports for compliance requirements
- Debug failing tests before committing
- Validate error handling paths

---

## 🎯 Recommended Workflow

1. **Start with Watch Mode** for general development
2. **Switch to Specific File** when focusing on one component
3. **Use Chrome DevTools** for complex debugging scenarios
4. **Run All Tests** before committing changes
5. **Use Manual/Grep** for troubleshooting specific test failures

This debugging setup ensures your Angular application meets government-grade quality standards while maintaining developer productivity.
// @ts-check
import angular from "@angular-eslint/eslint-plugin";
import angularTemplate from "@angular-eslint/eslint-plugin-template";
import angularTemplateParser from "@angular-eslint/template-parser";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".tmp/**",
      "out-tsc/**",
      ".vscode/**",
      ".DS_Store",
      ".env",
      "package-lock.json",
      "coverage/**",
      ".angular/**",
      "build/**",
      "target/**",
      "generated/**",
      "*.generated.ts",
      "*.generated.js",
      ".nyc_output/**",
      "cypress/videos/**",
      "cypress/screenshots/**",
      "cypress/downloads/**",
      "*.min.js",
      "*.bundle.js",
      "src/environments/environment.prod.ts", // If auto-generated
      "src/polyfills.ts", // If auto-generated
      "**/*.spec.js", // Compiled spec files
      "**/*.e2e.js", // Compiled e2e files
    ],
  },

  // Base JavaScript config (applied to all files)
  eslint.configs.recommended,

  // TypeScript files configuration
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.recommended, ...tseslint.configs.stylistic],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: 2022,
      },
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        location: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Promise: "readonly",
        Map: "readonly",
        Set: "readonly",
        WeakMap: "readonly",
        WeakSet: "readonly",
      },
    },
    plugins: {
      "@angular-eslint": angular,
    },
    rules: {
      // Angular-specific rules
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      "@angular-eslint/no-empty-lifecycle-method": "warn",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/use-pipe-transform-interface": "error",
      "@angular-eslint/component-class-suffix": "error",
      "@angular-eslint/directive-class-suffix": "error",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-readonly": "warn",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/ban-ts-comment": "off",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      // Add complexity rule for TypeScript files
      complexity: ["error", { max: 10 }],
    },
  },
  {
    files: ["cypress/**/*.ts", "cypress/**/*.js"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: 2022,
      },
      globals: {
        cy: "readonly",
        Cypress: "readonly",
        expect: "readonly",
        assert: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
    rules: {
      // Allow Cypress-required patterns
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off", // ← KEY: Allow namespaces for Cypress
      "@typescript-eslint/prefer-namespace-keyword": "off", // ← Allow declare global

      // General test file allowances
      "no-console": "off",
      complexity: ["error", { max: 15 }], // Allow longer test functions

      // Allow module-specific patterns
      "import/no-unresolved": "off", // Cypress plugins might not resolve
      "@typescript-eslint/triple-slash-reference": "off", // Allow /// references if needed
    },
  },
  // Angular template files configuration
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      "@angular-eslint/template": angularTemplate,
    },
    rules: {
      // Accessibility rules
      "@angular-eslint/template/alt-text": "warn",
      "@angular-eslint/template/label-has-associated-control": "warn",
      "@angular-eslint/template/no-positive-tabindex": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/mouse-events-have-key-events": "warn",

      // Angular template best practices
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/use-track-by-function": "warn",
      "@angular-eslint/template/conditional-complexity": [
        "warn",
        { maxComplexity: 8 },
      ],
      "@angular-eslint/template/cyclomatic-complexity": [
        "warn",
        { maxComplexity: 10 },
      ],
    },
  }
);

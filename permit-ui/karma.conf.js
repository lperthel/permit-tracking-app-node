// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

export default function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      "karma-jasmine",
      "karma-chrome-launcher",
      "karma-jasmine-html-reporter",
      "karma-coverage",
      "@angular-devkit/build-angular/plugins/karma",
    ],
    client: {
      jasmine: {
        // Jasmine configuration options
        // https://jasmine.github.io/api/edge/Configuration.html
        random: false, // Disable random test execution for consistent debugging
      },
      clearContext: false, // Leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // Removes duplicated traces for cleaner output
    },
    coverageReporter: {
      dir: "./coverage/permit-ui",
      subdir: ".",
      reporters: [
        { type: "html" }, // HTML coverage report for browsers
        { type: "text-summary" }, // Console summary
        { type: "lcov" }, // For CI tools like SonarQube
      ],
      check: {
        global: {
          statements: 80, // Government-grade coverage requirements
          branches: 70,
          functions: 80,
          lines: 80,
        },
      },
    },
    reporters: ["progress", "kjhtml", "coverage"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false,
    restartOnFileChange: true,
    // Add Chrome headless for CI
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-gpu"],
      },
    },
  });
}

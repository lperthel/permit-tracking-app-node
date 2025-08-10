// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
import karma_chrome_launcher from "karma-chrome-launcher";
import karma_coverage from "karma-coverage";
import karma_jasmine from "karma-jasmine";
import karma_jasmine_html_reporter from "karma-jasmine-html-reporter";
import karma_spec_reporter from "karma-spec-reporter";

export default function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],

    plugins: [
      karma_jasmine,
      karma_chrome_launcher,
      karma_jasmine_html_reporter,
      karma_coverage,
      karma_spec_reporter,
      "@angular-devkit/build-angular/plugins/karma",
    ],

    browsers: ["MyChrome"],

    customLaunchers: {
      MyChrome: {
        base: "Chrome",
        chromeDataDir: "/tmp/karma-chrome",
        flags: [
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
        ],
      },
    },

    singleRun: false,
    autoWatch: true,

    // Use spec reporter instead of mocha reporter
    reporters: ["spec", "kjhtml"],

    // Spec reporter config (works with Jasmine)
    specReporter: {
      maxLogLines: 5, // Limit console output per test
      suppressErrorSummary: false, // Show error summary
      suppressFailed: false, // Show failed tests
      suppressPassed: false, // Show passed tests
      suppressSkipped: true, // Hide skipped tests
      showSpecTiming: true, // Show timing info
    },

    // More verbose logging
    logLevel: config.LOG_INFO,

    // Show browser console logs in terminal
    client: {
      captureConsole: true,
      clearContext: false,
      jasmine: {
        // Force Jasmine to work with ES modules
        random: false,
      },
    },

    // Add module loading configuration

    // Ensure proper file loading order
    files: [
      // Jasmine files should be loaded by the framework, not manually
    ],

    // Better error reporting
    browserConsoleLogOptions: {
      level: "log",
      format: "%b %T: %m",
      terminal: true,
    },
  });
}

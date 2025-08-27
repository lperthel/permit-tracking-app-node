import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '85bzps',

  e2e: {
    baseUrl: 'http://localhost:4200',
    
    // Performance optimizations
    defaultCommandTimeout: 4000, // Reduced from default 10000ms
    requestTimeout: 5000,         // Reduced from default 10000ms  
    responseTimeout: 30000,       // Keep for API calls
    pageLoadTimeout: 60000,       // Keep for page loads
    
    // Disable slow features for faster runs
    video: false,                 // Disable video recording
    screenshotOnRunFailure: false, // Disable screenshots on failure
    trashAssetsBeforeRuns: true,   // Clean up before each run
    
    // Optimized retries
    retries: {
      runMode: 1,    // Only retry once in run mode
      openMode: 0    // No retries in open mode for faster development
    },
    
    // Viewport optimization
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Test isolation settings
    testIsolation: true,
    
    // Faster file watching
    watchForFileChanges: false,
  },
});

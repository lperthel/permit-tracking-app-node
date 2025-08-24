import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '85bzps',

  e2e: {
    baseUrl: 'http://localhost:4200',
  },
});

const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'e2e/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'e2e/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    env: {
      apiUrl: 'http://localhost:5001'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

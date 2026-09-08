const { defineConfig, devices } = require('@playwright/test');
const { createProdPlaywrightConfig } = require('./playwright.shared');

module.exports = defineConfig(createProdPlaywrightConfig(__dirname, devices['Desktop Chrome']));

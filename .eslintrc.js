/* eslint-env node */
module.exports = {
  plugins: ["react"],
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parserOptions: {
    sourceType: "module"
  },
  env: {
    browser: true,
    es2021: true
  },
  rules: {
    quotes: ["error", "double", { avoidEscape: true }],
    "comma-dangle": ["error", "never"],
    "no-unused-vars": ["error"],
    "react/display-name": "off"
  },
  settings: {
    react: {
      version: "17.0.2"
    }
  }
};

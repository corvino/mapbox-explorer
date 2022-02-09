/* eslint-env node */
module.exports = {
  plugins: ["react", "tailwindcss"],
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:tailwindcss/recommended"],
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
    "react/display-name": "off",
    "react/prop-types": "disabled"
  },
  settings: {
    react: {
      version: "17.0.2"
    }
  }
};

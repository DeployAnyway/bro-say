export default [
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "constructor-super": "error",
      "valid-typeof": "error",
    },
  },
  {
    files: ["demo/*.js"],
    languageOptions: {
      globals: { document: "readonly", navigator: "readonly" },
    },
  },
];

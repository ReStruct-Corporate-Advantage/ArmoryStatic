module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "camelcase": "off",
    "eol-last": "off",
    "import/namespace": "off",
    "import/no-unresolved": 0,
    "indent": "off",
    "max-len": "off",
    "new-cap": "off",
    "no-unused-vars": "off",
    "no-var": "off",
    "no-invalid-this": "off",
    "object-curly-spacing": "off",
    "quotes": ["error", "double"],
    "require-jsdoc": "off",
    "space-before-function-paren": "off",
    "spaced-comment": "off",
    "valid-jsdoc": "off",
  },
};

/** @type {import('eslint').Linter.Config} */
module.exports = {
   root: true,
   parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
         jsx: true,
      },
      project: "./tsconfig.json",
   },
   env: {
      browser: true,
      es2021: true,
      commonjs: true,
   },
   extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
      "prettier/prettier",
      "plugin:react/jsx-runtime",
      "plugin:jsx-a11y/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:deprecation/recommended",
   ],
   parser: "@typescript-eslint/parser",
   settings: {
      "import/parsers": {
         "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
         typescript: {
            alwaysTryTypes: true,
         },
      },
      react: {
         version: "detect",
      },
   },
   plugins: ["react", "@typescript-eslint", "prettier", "jsx-a11y", "import"],
   overrides: [
      {
         files: ["*.ts", "*.tsx", ".server/**/*.js", ".server/**/*.jsx", ".server/**/*.ts", ".server/**/*.tsx"],
         rules: {
            "@typescript-eslint/no-unused-vars": [
               "warn",
               {
                  ignoreRestSiblings: true,
               },
            ],
            "prettier/prettier": [
               "warn",
               {
                  endOfLine: "auto",
               },
            ],
            "react/prop-types": "off",
            "require-await": "warn",
            "@typescript-eslint/no-floating-promises": ["warn"],
            "@typescript-eslint/await-thenable": ["warn"],
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/consistent-type-imports": "error",
            "react/display-name": "off",
            "import/no-cycle": "warn",
            "@typescript-eslint/no-unnecessary-condition": "warn",
            "import/order": [
               "warn",
               {
                  groups: ["builtin", "external", "internal"],
                  "newlines-between": "always",
                  alphabetize: {
                     order: "asc",
                     caseInsensitive: true,
                  },
               },
            ],
         },
      },
   ],
};
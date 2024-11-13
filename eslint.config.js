import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import * as importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintConfigPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";
import "eslint-import-resolver-typescript";

/** @type {import('eslint').Linter.Config} */
export default [
   {
      ignores: [
         "**/node_modules/",
         "build/",
         ".react-router",
         "test-results",
         "playwright-report",
         "server.mjs",
         "public/sw.js",
         "launch-webkit.js",
         "eslint.config.js",
         "!app/.server",
      ],
   },
   {
      files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
   },
   {
      languageOptions: {
         parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
         },
      },
   },
   {
      settings: {
         "import/resolver": {
            typescript: true,
            node: true,
         },
         react: {
            createClass: "createReactClass", // Regex for Component Factory to use,
            // default to "createReactClass"
            pragma: "React", // Pragma to use, default to "React"
            fragment: "Fragment", // Fragment to use (may be a property of <pragma>), default to "Fragment"
            version: "detect", // React version. "detect" automatically picks the version you have installed.
            // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
            // Defaults to the "defaultVersion" setting and warns if missing, and to "detect" in the future
            defaultVersion: "18.3.1", // Default React version to use when the version you have installed cannot be detected.
            // If not provided, defaults to the latest React version.
         },
         formComponents: [
            // Components used as alternatives to <form> for forms, eg. <Form endpoint={ url } />
            "Form",
         ],
         linkComponents: [{ name: "Link", linkAttribute: "to" }],
      },
   },
   {
      languageOptions: {
         ...jsxA11y.flatConfigs.recommended.languageOptions,
         globals: { ...globals.browser, ...globals.node },
      },
   },
   eslint.configs.recommended,
   ...tseslint.configs.recommended,
   ...tseslint.configs.recommendedTypeChecked,
   pluginReact.configs.flat.recommended,
   importPlugin.flatConfigs.recommended,
   jsxA11y.flatConfigs.recommended,
   {
      rules: {
         "@typescript-eslint/no-unused-vars": [
            "warn",
            {
               ignoreRestSiblings: true,
            },
         ],
         "react/react-in-jsx-scope": "off",
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
         "@typescript-eslint/only-throw-error": "off",
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
   eslintConfigPrettierRecommended,
   // Turn off rules that conflict with prettier
   eslintConfigPrettier,
];
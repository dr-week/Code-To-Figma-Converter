import js from "@eslint/js";
import tseslint from "typescript-eslint";
export default tseslint.config(
  { ignores: ["**/dist/**", ".artifacts/**", "**/node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["packages/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@open-pencil/*",
            "@code-to-figma/browser*",
            "@code-to-figma/figma*",
            "playwright",
            "react",
            "next",
            "node:*",
          ],
        },
      ],
    },
  },
  {
    files: ["packages/tooling/**/*.ts"],
    ignores: ["packages/tooling/openpencil/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@open-pencil/*"],
        },
      ],
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: { globals: { process: "readonly" } },
  },
);

const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const reactNative = require("eslint-plugin-react-native");

module.exports = defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.expo/**",
    "**/dist/**",
    "**/web-build/**",
    "apps/**/assets/**",
    "apps/**/slides/**",
    "docs/**",
    "apps/**/src/data/db/migrations/**",
    "apps/**/ios/**",
    "apps/**/android/**",
    "**/expo-env.d.ts",
  ]),
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    settings: {
      react: {
        version: "19.3",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: [
            "./apps/01-rn-basics/tsconfig.json",
            "./apps/02-rn-perf/tsconfig.json",
            "./apps/03-native-modules/tsconfig.json",
            "./apps/03-jsi/tsconfig.json",
          ],
        },
      },
    },
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      // Stricter than Biome was; workshop code uses intentional effects.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  {
    files: ["apps/**/src/app/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-native": reactNative,
    },
    rules: {
      "react-native/no-raw-text": [
        "error",
        {
          skip: ["NativeTabs.Trigger.Label", "Stack.Title", "ThemedText"],
        },
      ],
    },
  },
]);

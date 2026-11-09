/**
 * Bun blocks @shopify/react-native-skia postinstall unless trusted (see root trustedDependencies).
 * When it runs, cwd must be the package root — in a monorepo a manual install from repo root can fail.
 * This hook downloads Skia binaries if libs/apple/ios is still missing (02-rn-perf needs them for iOS).
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(fileURLToPath(import.meta.url));

let skiaRoot;
try {
  skiaRoot = path.dirname(require.resolve("@shopify/react-native-skia/package.json"));
} catch {
  process.exit(0);
}

const iosLibs = path.join(skiaRoot, "libs/apple/ios");
if (existsSync(iosLibs) && existsSync(path.join(iosLibs, "libskia.xcframework"))) {
  process.exit(0);
}

const result = spawnSync("node", ["./scripts/install-skia.mjs"], {
  cwd: skiaRoot,
  stdio: "inherit",
});

process.exit(result.status ?? 1);

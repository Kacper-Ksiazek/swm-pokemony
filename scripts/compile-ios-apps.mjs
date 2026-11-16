// Compile iOS targets for apps that ship native module sources under apps/<id>/modules/
// (Swift, Objective-C++, or C++). macOS + Xcode only; other platforms exit 0 with a skip message.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function appsWithNativeModuleSources() {
  const out = spawnSync(
    "find",
    [
      "apps",
      "-path",
      "*/modules/*",
      "(",
      "-name",
      "*.swift",
      "-o",
      "-name",
      "*.mm",
      "-o",
      "-name",
      "*.cpp",
      ")",
      "-type",
      "f",
    ],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (out.status !== 0) {
    return [];
  }
  const apps = new Set();
  for (const rel of out.stdout.trim().split("\n").filter(Boolean)) {
    const match = rel.match(/^apps\/([^/]+)\//);
    if (match) {
      apps.add(path.join("apps", match[1]));
    }
  }
  return [...apps].sort();
}

function ensurePrebuild(appRel) {
  const appDir = path.join(ROOT, appRel);
  const iosDir = path.join(appDir, "ios");
  if (fs.existsSync(iosDir)) {
    return;
  }
  console.log(`No ios/ in ${appRel}; running expo prebuild --platform ios…`);
  const result = spawnSync("bunx", ["expo", "prebuild", "--platform", "ios"], {
    cwd: appDir,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error(`expo prebuild failed for ${appRel}`);
    process.exit(result.status ?? 1);
  }
}

function resolveWorkspace(iosDir) {
  const workspaceName = fs.readdirSync(iosDir).find((name) => name.endsWith(".xcworkspace"));
  if (!workspaceName) {
    console.error(
      `No .xcworkspace under ${iosDir}. From the app package run: bunx expo prebuild --platform ios`,
    );
    process.exit(1);
  }
  const scheme = path.basename(workspaceName, ".xcworkspace");
  return {
    workspace: path.join(iosDir, workspaceName),
    scheme,
  };
}

function compileApp(appRel) {
  ensurePrebuild(appRel);
  const iosDir = path.join(ROOT, appRel, "ios");
  const { workspace, scheme } = resolveWorkspace(iosDir);

  console.log(`\n▸ xcodebuild ${scheme} (${appRel})`);

  const result = spawnSync(
    "xcodebuild",
    [
      "-workspace",
      workspace,
      "-scheme",
      scheme,
      "-configuration",
      "Debug",
      "-sdk",
      "iphonesimulator",
      "-destination",
      "generic/platform=iOS Simulator",
      "CODE_SIGNING_ALLOWED=NO",
      "build",
    ],
    { cwd: iosDir, stdio: "inherit" },
  );
  return result.status ?? 1;
}

if (process.platform !== "darwin") {
  console.log("compile:ios skipped (macOS + Xcode required for Swift compilation).");
  process.exit(0);
}

if (spawnSync("xcodebuild", ["-version"], { encoding: "utf8" }).status !== 0) {
  console.error("xcodebuild not found. Install Xcode and select it with xcode-select.");
  process.exit(1);
}

const explicitApp = process.argv[2];
const apps = explicitApp ? [explicitApp.replace(/^\.\//, "")] : appsWithNativeModuleSources();

if (apps.length === 0) {
  console.log("No native module sources under apps/*/modules/; nothing to compile.");
  process.exit(0);
}

let code = 0;
for (const appRel of apps) {
  code = Math.max(code, compileApp(appRel));
}
process.exit(code);

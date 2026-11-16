// SwiftFormat + ktlint for sources under apps/.../modules/ (not generated app ios/android trees).

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureKtlint, ensureSwiftFormat, onPath } from "./ensure-native-linters.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODE = process.argv[2] === "write" ? "write" : "check";

function findModuleSources(ext) {
  const out = spawnSync(
    "find",
    ["apps", "-path", "*/modules/*", "-name", `*.${ext}`, "-type", "f"],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (out.status !== 0) {
    return [];
  }
  return out.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((rel) => path.join(ROOT, rel));
}

function run(bin, args) {
  const result = spawnSync(bin, args, { cwd: ROOT, stdio: "inherit" });
  return result.status ?? 1;
}

async function lintSwift(swiftformat, files) {
  if (files.length === 0) {
    return 0;
  }
  if (!swiftformat) {
    console.error(
      "Swift sources found but SwiftFormat is not available. Run `brew install swiftformat` or `node scripts/ensure-native-linters.mjs`.",
    );
    return 1;
  }

  const args =
    MODE === "write"
      ? ["--config", ".swiftformat", ...files]
      : ["--lint", "--config", ".swiftformat", ...files];
  return run(swiftformat, args);
}

async function lintKotlin(ktlint, files) {
  if (files.length === 0) {
    return 0;
  }
  if (!ktlint) {
    console.error("Kotlin sources found but ktlint is not available.");
    return 1;
  }

  const args =
    MODE === "write"
      ? ["-F", "editorconfig", ...files]
      : ["--editorconfig", path.join(ROOT, ".editorconfig"), ...files];
  return run(ktlint, args);
}

const swiftFiles = findModuleSources("swift");
const ktFiles = findModuleSources("kt");

async function resolveSwiftformat() {
  return process.env.SWIFTFORMAT_BIN ?? onPath("swiftformat") ?? (await ensureSwiftFormat());
}

async function resolveKtlint() {
  if (ktFiles.length === 0) {
    return null;
  }
  return process.env.KTLINT_BIN ?? onPath("ktlint") ?? (await ensureKtlint());
}

const swiftformat = swiftFiles.length > 0 ? await resolveSwiftformat() : null;
const ktlint = await resolveKtlint();

let code = 0;
code = Math.max(code, await lintSwift(swiftformat, swiftFiles));
code = Math.max(code, await lintKotlin(ktlint, ktFiles));
process.exit(code);

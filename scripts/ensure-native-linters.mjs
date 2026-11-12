/**
 * Downloads SwiftFormat and ktlint into .tools/ when missing (CI and fresh clones).
 */

import { spawnSync } from "node:child_process";
import { chmodSync, createWriteStream, existsSync, mkdirSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOOLS = path.join(ROOT, ".tools");

const SWIFTFORMAT_VERSION = "0.64.6";
const KTLINT_VERSION = "1.8.0";

const platform = process.platform;
const arch = process.arch;

function swiftFormatAsset() {
  if (platform === "darwin") {
    return "swiftformat.zip";
  }
  if (platform === "linux") {
    return arch === "arm64" ? "swiftformat_linux_aarch64.zip" : "swiftformat_linux.zip";
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed ${res.status}: ${url}`);
  }
  await pipeline(res.body, createWriteStream(dest));
}

export async function ensureSwiftFormat() {
  const bin = path.join(TOOLS, "swiftformat");
  if (existsSync(bin)) {
    return bin;
  }

  const asset = swiftFormatAsset();
  if (!asset) {
    console.warn(
      "SwiftFormat: no prebuilt binary for this OS; install via `brew install swiftformat`.",
    );
    return null;
  }

  mkdirSync(TOOLS, { recursive: true });
  const zipPath = path.join(TOOLS, asset);
  const base = `https://github.com/nicklockwood/SwiftFormat/releases/download/${SWIFTFORMAT_VERSION}`;
  await download(`${base}/${asset}`, zipPath);

  const unzip = spawnSync("unzip", ["-o", "-q", zipPath, "-d", TOOLS], { encoding: "utf8" });
  if (unzip.status !== 0) {
    throw new Error(`unzip swiftformat failed: ${unzip.stderr}`);
  }

  const nested = path.join(TOOLS, "swiftformat");
  if (!existsSync(nested)) {
    throw new Error("SwiftFormat binary missing after unzip");
  }
  chmodSync(nested, 0o755);
  return nested;
}

export async function ensureKtlint() {
  const bin = path.join(TOOLS, "ktlint");
  if (existsSync(bin)) {
    return bin;
  }

  mkdirSync(TOOLS, { recursive: true });
  const url = `https://github.com/pinterest/ktlint/releases/download/${KTLINT_VERSION}/ktlint`;
  await download(url, bin);
  chmodSync(bin, 0o755);
  return bin;
}

export function onPath(command) {
  const found = spawnSync("which", [command], { encoding: "utf8" });
  const line = found.stdout?.trim();
  return line ? line : null;
}

export async function resolveNativeLinters() {
  const swiftformat =
    process.env.SWIFTFORMAT_BIN ?? onPath("swiftformat") ?? (await ensureSwiftFormat());
  const ktlint = process.env.KTLINT_BIN ?? onPath("ktlint") ?? (await ensureKtlint());
  return { swiftformat, ktlint };
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  await resolveNativeLinters();
}

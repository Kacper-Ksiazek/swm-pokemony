import { execFileSync } from "node:child_process";

const bundleId = "com.anonymous.kksiazek-pokemony";

const booted = execFileSync("xcrun", ["simctl", "list", "devices", "booted", "-j"], {
  encoding: "utf8",
});
const devices = JSON.parse(booted).devices;
const udid = Object.values(devices)
  .flat()
  .find((device) => device.state === "Booted")?.udid;

if (!udid) {
  throw new Error("No booted iOS simulator. Boot one before this e2e test.");
}

const container = execFileSync(
  "xcrun",
  ["simctl", "get_app_container", udid, bundleId, "data"],
  { encoding: "utf8" },
).trim();

execFileSync("sqlite3", [
  `${container}/Documents/SQLite/pokemony.db`,
  "DELETE FROM map_pin;",
]);

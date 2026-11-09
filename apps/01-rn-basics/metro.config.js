const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Lets Metro resolve drizzle's generated .sql migration files.
config.resolver.sourceExts.push("sql");

module.exports = config;

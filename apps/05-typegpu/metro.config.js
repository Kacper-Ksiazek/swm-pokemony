const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// three.js ships a WebGL build ("three") and a WebGPU build ("three/webgpu").
// On React Native only WebGPU exists, so every bare "three" import resolves to the WebGPU build.
// One build also means one copy of three's classes for our code, @typegpu/three, and three/tsl.
// three does not export "./package.json", so resolve its main entry (build/three.cjs) instead.
const threeBuildDir = path.dirname(require.resolve("three"));
const threeWebGPUBuild = path.resolve(threeBuildDir, "three.webgpu.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "three" || moduleName === "three/webgpu") {
    return { filePath: threeWebGPUBuild, type: "sourceFile" };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

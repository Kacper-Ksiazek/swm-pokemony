module.exports = (api) => {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    // Compiles `"use gpu"` functions to WGSL for TypeGPU.
    plugins: ["unplugin-typegpu/babel"],
  };
};

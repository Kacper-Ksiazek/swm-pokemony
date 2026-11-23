module.exports = (api) => {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    // Turns `"use gpu"` functions into shader code that TypeGPU (and @typegpu/three) can compile.
    plugins: ["unplugin-typegpu/babel"],
  };
};

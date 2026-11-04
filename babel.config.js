module.exports = (api) => {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    // Inlines drizzle's generated .sql migration files as strings into the bundle.
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
};

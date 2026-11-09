import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./src/data/db/schema",
  out: "./src/data/db/migrations",
});

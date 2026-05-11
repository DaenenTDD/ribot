import initEnv from "@/core/lib/initEnv.js";
import { defineConfig } from "drizzle-kit";

await initEnv();

export default defineConfig({
    schema: "./src/database/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: process.env.DB_FILE_NAME!,
    },
});

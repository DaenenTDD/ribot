import logger from "@/utils/logger.js";
import { drizzle } from "drizzle-orm/libsql";

if (!process.env.DB_FILE_NAME) {
    throw new Error("DB_FILE_NAME is undefined. Did you import the db somewhere before running initEnv?")
}

logger.debug("Creating db");
export const db = drizzle(process.env.DB_FILE_NAME);

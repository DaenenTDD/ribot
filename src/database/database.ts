import logger from "@/utils/logger.js";
import { drizzle } from "drizzle-orm/libsql";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
    if (_db) return _db;

    if (!process.env.DB_FILE_NAME) {
        throw new Error("DB_FILE_NAME is undefined. Did you import the db somewhere before running initEnv?");
    }

    logger.debug("Creating db");
    _db = drizzle(process.env.DB_FILE_NAME);
    return _db;
}
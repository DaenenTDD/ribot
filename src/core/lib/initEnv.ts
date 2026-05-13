import { config } from "dotenv";
import { parseArgs } from "./parseArgs.js";
import fs from "fs";
import logger from "@/utils/logger.js";

export default function initEnv(): void {
    if (process.env.DISCORD_TOKEN) {
        logger.info(
            "It appears env vars are already loaded, skipping initEnv()",
        );
        return;
    }

    const args = parseArgs();
    const envArg = args.env;

    const existingEnvFiles = checkEnvFiles();
    if (existingEnvFiles.length === 1 && existingEnvFiles[0] === ".env") {
        logger.warn(
            "Only .env file found. Consider creating .env.development and .env.production files.",
        );
        config({ path: ".env", quiet: true });
        return;
    }

    if (envArg) {
        switch (envArg) {
            case "production":
                config({ path: ".env.production", quiet: true });
                break;
            case "development":
                config({ path: ".env.development", quiet: true });
                break;
            default:
                throw new Error(
                    `Invalid environment value: ${envArg}. Expected "production" or "development".`,
                );
        }
    } else {
        if (!existingEnvFiles.includes(".env.development"))
            throw new Error(
                "No .env.development file found. Either run with env=production or create a .env.development file.",
            );
        logger.warn("No environment specified, defaulting to .env.development");
        config({ path: ".env.development", quiet: true });
    }
}

function checkEnvFiles(): string[] {
    const envFiles = [".env", ".env.development", ".env.production"];
    const existingEnvFiles = envFiles.filter((file) => fs.existsSync(file));

    if (existingEnvFiles.length === 0) {
        throw new Error(
            "No .env files found. Please create one of the following: .env, .env.development, or .env.production, or, if you are running this via a docker image, ensure docker-compose.yml contains your env_file",
        );
    }
    return existingEnvFiles;
}

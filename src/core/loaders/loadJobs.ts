import { walk } from "../lib/walk.js";
import { pathToFileURL } from "url";
import path from "path";
import type { Job } from "@/types/job.js";
import logger from "@/utils/logger.js";
import type { Client } from "discord.js";

/**
 * Loads all jobs from the src/jobs directory and registers them using setInterval.
 */

export async function loadJobs(client: Client): Promise<void> {
    const files = walk("src/jobs");

    for (const file of files) {
        const parts = file.split(path.sep);
        if (!parts.includes("jobs")) continue;
        const { default: job } = (await import(pathToFileURL(file).href)) as {
            default: Job;
        };

        if (!job) {
            logger.warn(`No job found in file: ${file}`);
            continue;
        }

        if (!job.job || !job.interval) {
            logger.warn(`Invalid job file: ${file}`);
            continue;
        }

        setInterval(async () => {
            try {
                await job.job(client);
            } catch (error) {
                logger.error(`Error executing job from file ${file}: ${error}`);
            }
        }, job.interval);

        logger.debug(
            `Loaded job with interval ${job.interval}ms from file: ${file}`,
        );
    }
}

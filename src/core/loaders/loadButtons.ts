import { Client } from "discord.js";
import { walk } from "@/core/lib/walk.js";
import path from "path";
import { pathToFileURL } from "url";
import type { Button } from "../../types/button.ts";
import logger from "@/utils/logger.js";

/**
 * Loads buttons from the src/features directory and adds them to the client's buttons collection.
 * @param client The client to add the buttons to.
 */
export async function loadButtons(client: Client): Promise<void> {
    const files = walk("src/features");

    for (const file of files) {
        const parts = file.split(path.sep);
        if (!parts.includes("buttons")) continue;
        const { default: button } = await import(pathToFileURL(file).href) as { default: Button };

        if (!button) {
            logger.warn(`No button found in file: ${file}`);
            continue;
        }

        if (!button.data || !button.execute) {
            logger.warn(`Invalid button file: ${file}`);
            continue;
        }

        if (!button.customId) continue;

        if (client.buttons.has(button.customId)) {
            logger.error(`Duplicate button customId detected: ${button.customId} in file ${file}. Each button must have a unique customId.`);
            throw new Error(`Duplicate button customId detected: ${button.customId} in file ${file}. Each button must have a unique customId.`);
        }

        client.buttons.set(button.customId, button);
        logger.debug(`Loaded button with customId ${button.customId} from file: ${file}`);
    }
}
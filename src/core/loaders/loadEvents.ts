import { walk } from "../lib/walk.js";
import { pathToFileURL } from "url";
import path from "path";
import type { Event } from "@/types/event.js";
import type { Client, ClientEvents } from "discord.js";
import logger from "@/utils/logger.js";

/**
 * Loads events from the src/features directory and adds them to the client's event listeners.
 * @param client The client to add the events to.
 */
export async function loadEvents(client: Client): Promise<void> {
    const files = walk("src/features");

    for (const file of files) {
        const parts = file.split(path.sep);
        if (!parts.includes("events")) continue;
        const { default: event } = await import(pathToFileURL(file).href) as { default: Event };

        if (!event) {
            logger.warn(`No event found in file: ${file}`);
            continue;
        }

        if (!event.event || !event.execute) {
            logger.warn(`Invalid event file: ${file}`);
            continue;
        }
        logger.debug(`Loaded event with name ${event.event} from file: ${file}`);

        if (event.once) {
            client.once(event.event as keyof ClientEvents, event.execute);
        } else {
            client.on(event.event as keyof ClientEvents, event.execute);
        }
    }
}
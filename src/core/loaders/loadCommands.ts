import type { Client, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { walk } from "@/core/lib/walk.js";
import { pathToFileURL } from "url";
import type { Command } from "@/types/command.js";
import path from "path";
import logger from "@/utils/logger.js";

/**
 * Loads commands from the src/features directory and adds them to the client's command collection.
 * @param client The client to add the commands to.
 */
export async function loadCommands(client: Client): Promise<void> {
    const files = walk("src/features");

    for (const file of files) {
        const parts = file.split(path.sep);
        if (!parts.includes("commands")) continue;
        logger.debug(`Loading command from file: ${file}`);
        const { default: command } = await import(pathToFileURL(file).href) as { default: Command };

        if (!command) {
            logger.warn(`No command found in file: ${file}`);
            continue;
        }

        if (!command.data || !command.execute) {
            logger.warn(`Invalid command file: ${file}`);
            continue;
        }
        client.commands.set(command.data.name, command);
        logger.debug(`Loaded command with name ${command.data.name} from file: ${file}`);
    }
}

/**
 * Loads command data from the src/features directory. Usually used for deploying commands to Discord.
 * @returns A promise resolving to an array of command data.
 */
export async function loadCommandData(): Promise<RESTPostAPIApplicationCommandsJSONBody[]> {
    const files = walk("src/features");
    const commandData = [];

    for (const file of files) {
        const parts = file.split(path.sep);
        if (!parts.includes("commands")) continue;
        const { default: command } = await import(pathToFileURL(file).href) as { default: Command };

        if (!command) {
            logger.warn(`No command found in file: ${file}`);
            continue;
        }

        if (!command.data || !command.execute) {
            logger.warn(`Invalid command file: ${file}`);
            continue;
        }
        commandData.push(command.data.toJSON());
    }
    return commandData;
}
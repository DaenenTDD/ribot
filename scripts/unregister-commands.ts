import { ApplicationCommand, REST, Routes, type RESTError } from "discord.js";
import initEnv from "@/core/lib/initEnv.js";
import { getFlags } from "@/core/lib/parseArgs.js";
import logger from "@/utils/logger.js";

await initEnv().catch((error) => {
    logger.error(`Error initializing environment variables: ${error.message}`);
    process.exit(1);
});

const flags = getFlags();
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

const unregisterCommand = async (commandID: string): Promise<void> => {
    try {
        await rest.delete(Routes.applicationGuildCommand(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!, commandID));
        logger.info(`Unregistered command with ID ${commandID}`);
    } catch (error: any) {
        logger.error(`Error unregistering command with ID ${commandID}: ${error.message}`);
    }
};

const unregisterGlobalCommand = async (commandID: string): Promise<void> => {
    try {
        await rest.delete(Routes.applicationCommand(process.env.DISCORD_CLIENT_ID!, commandID));
    } catch (error: any) {
        logger.error(`Error unregistering global command with ID ${commandID}: ${error.message}`);
    }
    logger.info(`Unregistered global command with ID ${commandID}`);
};

let currentCommands: ApplicationCommand[] = [];

if (flags.includes("--global")) {
    currentCommands = await rest.get(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!)) as ApplicationCommand[];
} else {
    currentCommands = await rest.get(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!)) as ApplicationCommand[];
}

if (currentCommands.length === 0) {
    logger.info("No commands found to unregister.");
    process.exit(0);
}

const commandIDs = process.argv.slice(2).filter(arg => !arg.startsWith("--") && !arg.includes("="));

if (flags.includes("--all")) {

    if (commandIDs.length > 0) {
        logger.error("You cannot specify command IDs when using the --all flag.")
        process.exit(1);
    }

    for (const command of currentCommands) {
        commandIDs.push(command.id);
    }
}

if (commandIDs.length === 0) {
    logger.error("No command IDs provided. Please specify command IDs to unregister or use the --all flag to unregister all commands.");
    process.exit(1);
}

if (flags.includes("--global")) {
    for (const commandID of commandIDs) {
        await unregisterGlobalCommand(commandID);
    }
} else {
    for (const commandID of commandIDs) {
        await unregisterCommand(commandID);
    }
}




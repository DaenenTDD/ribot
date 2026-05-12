import { REST, Routes } from "discord.js";
import { loadCommandData } from "@/core/loaders/loadCommands.js";
import initEnv from "@/core/lib/initEnv.js";
import { getFlags } from "@/core/lib/parseArgs.js";
import logger from "@/utils/logger.js";

initEnv();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);
const commandData = await loadCommandData();

const deployCommandsGuildOnly = async (): Promise<void> => {
    try {
        logger.info(`Deploying ${commandData.length} guild only commands...`);
        await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), { body: commandData });
        logger.info("Commands deployed successfully.");
    } catch (error) {
        logger.error(`Error deploying commands: ${error}`);
    }
};

const deployCommandsGlobal = async (): Promise<void> => {
    try {
        logger.info(`Deploying ${commandData.length} global commands...`);
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), { body: commandData });
        logger.info("Commands deployed successfully.");
    } catch (error) {
        logger.error(`Error deploying commands: ${error}`);
    }
}

if (getFlags().includes("--global")) {
    await deployCommandsGlobal();
} else {
    await deployCommandsGuildOnly();
}
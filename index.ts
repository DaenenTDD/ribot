import initEnv from "@/core/lib/initEnv.js";
initEnv();

import { Collection, Client } from "discord.js";
import { loadCommands } from "@/core/loaders/loadCommands.js";
import { loadEvents } from "@/core/loaders/loadEvents.js";
import { loadButtons } from "@/core/loaders/loadButtons.js";
import logger from "@/utils/logger.js";
const { saveMemoryToDB } = await import("@/utils/saveMemoryToDB.js");

logger.info("Starting...");
logger.info(`Arguments: ${process.argv.slice(2).join(" ")}`);


const initializeClient = async (): Promise<Client> => {
    const client = new Client({
        intents: ["Guilds", "GuildMessages", "MessageContent", "GuildVoiceStates"],
    });

    client.commands = new Collection();
    client.buttons = new Collection();
    client.cooldowns = new Collection();

    await loadCommands(client);
    await loadButtons(client);
    await loadEvents(client);

    return client;
};

const shutdown = async (signal: string) => {
    logger.info(`Recieved signal ${signal}. Shutting down gracefully...`)
    console.log(`Recieved signal ${signal}. Shutting down gracefully...`)
    await saveMemoryToDB();
    process.exit();
}

const client = await initializeClient();

client.login(process.env.DISCORD_TOKEN).then(() => {
    logger.info(`Bot logged in successfully as ${client.user?.tag}`);
    console.log(`Bot logged in successfully as ${client.user?.tag}`);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));


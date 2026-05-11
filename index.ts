import { Collection, Client } from "discord.js";
import { loadCommands } from "@/core/loaders/loadCommands.js";
import initEnv from "@/core/lib/initEnv.js";
import { loadEvents } from "@/core/loaders/loadEvents.js";
import { loadButtons } from "@/core/loaders/loadButtons.js";
import logger from "@/utils/logger.js";

logger.info("Starting...");
logger.info(`Arguments: ${process.argv.slice(2).join(" ")}`);

await initEnv();

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

const client = await initializeClient();

client.login(process.env.DISCORD_TOKEN).then(() => {
    logger.info(`Bot logged in successfully as ${client.user?.tag}`);
    console.log(`Bot logged in successfully as ${client.user?.tag}`);
});

process.on("SIGINT", () => {
    logger.info("Shutting down (SIGINT)...");
    client.destroy();
    process.exit(0);
})


import type { Event } from "@/types/event.js";
import { Events, InteractionType } from "discord.js";
import { chatInputCommandHandler } from "@/core/handlers/chatInputCommandHandler.js";
import { buttonHandler } from "@/core/handlers/buttonHandler.js";
import logger from "@/utils/logger.js";

export default {
    event: Events.InteractionCreate,
    async execute(interaction) {
        logger.debug(`Recieved interaction of type ${interaction.type}`);
        logger.debug(
            `Interaction details: ${JSON.stringify(interaction, (key, value) => (typeof value === "bigint" ? value.toString() : value), 2)}`,
        );
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                await chatInputCommandHandler(interaction);
                break;
            case InteractionType.MessageComponent:
                if (interaction.isButton()) await buttonHandler(interaction);
                break;
            default:
                logger.warn(`Unhandled interaction type: ${interaction.type}`);
        }
    },
} satisfies Event;

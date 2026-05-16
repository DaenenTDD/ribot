import type { Event } from "@/types/event.js";
import { Events, InteractionType } from "discord.js";
import { chatInputCommandHandler } from "@/core/handlers/chatInputCommandHandler.js";
import { buttonHandler } from "@/core/handlers/buttonHandler.js";
import logger from "@/utils/logger.js";

export default {
    event: Events.InteractionCreate,
    async execute(interaction) {
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

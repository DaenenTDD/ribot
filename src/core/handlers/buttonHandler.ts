import type { Button } from "@/types/button.js";
import { MessageFlags, type BaseInteraction } from "discord.js";
import logger from "@/utils/logger.js";


export const buttonHandler = async (interaction: BaseInteraction): Promise<void> => {
    if (!interaction.isButton()) return;
    const button: Button = interaction.client.buttons.get(interaction.customId)!;
    if (!button) return logger.error(`Recieved button interaction with custom id ${interaction.customId} but no button with that id is loaded.`)
    
    try {
        await button.execute(interaction);
    } catch (error: any) {
        logger.error(`Error executing button with custom id ${interaction.customId}: ${error.message}`);
        await interaction.reply({ 
            content: "An error occurred while executing the button.",
            flags: MessageFlags.Ephemeral,
        });
    }
} 
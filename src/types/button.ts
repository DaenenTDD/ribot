import type { ButtonBuilder, ButtonInteraction } from "discord.js";

/**
 * A button handler for a Discord button interaction.
 */
export interface Button {
    customId?: string;
    data: ButtonBuilder;
    execute(interaction: ButtonInteraction): Promise<void>;
}
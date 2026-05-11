import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "@/types/command.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            content: "Pong!",
        });
    },

    cooldown: 3,
} satisfies Command;

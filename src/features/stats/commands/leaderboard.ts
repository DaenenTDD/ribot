import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "@/types/command.js";
import voiceLeaderboard from "../subcommands/leaderboard/voiceLeaderboard.js";

export default {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Show various server leaderboards")
        .addSubcommand(voiceLeaderboard.subcommand),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case voiceLeaderboard.subcommand.name:
                await voiceLeaderboard.execute(interaction);
        }
    },

    cooldown: 3,
} satisfies Command;

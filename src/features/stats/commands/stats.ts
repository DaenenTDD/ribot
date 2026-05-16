import { ChatInputCommandInteraction, Colors, ContainerBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder, escapeMarkdown } from "discord.js";
import type { Command } from "@/types/command.js";
import { getDb } from "@/database/database.js";
import { voiceStats } from "@/database/schema.js";
import { eq } from "drizzle-orm";
import { voiceStore } from "../voiceStore.js";
import { formatDuration } from "@/core/lib/formatDuration.js";

export default {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Show various statistics about a user!")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to get the stats for")
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user", true);
        const row = await getVoiceStatsRow(user.id)

        let stats = row[0];
        if (!stats) {
            stats = {
                userId: user.id,
                username: user.username,
                timeInVoice: 0,
                timeMuted: 0,
                timeDeafened: 0,
                updatedAt: 0,
            }
        }

        const merged = mergeStats(stats, user.id);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                (textDisplay) =>
                    textDisplay.setContent(`## Stats for ${escapeMarkdown(user.displayName)}`),
                (textDisplay) =>
                    textDisplay.setContent(`-# Last updated: ${merged.updatedAt == 0 ? "never" : new Date(merged.updatedAt).toLocaleString("en-GB", { hour12: true })}`)
            )
            .addSeparatorComponents((separator) => separator)
            .addTextDisplayComponents(
                (textDisplay) =>
                    textDisplay.setContent(`**Time Spent In Voice Channels:** \`${formatDuration(merged.timeInVoice / 1000)}\``),
                (textDisplay) =>
                    textDisplay.setContent(`**Time Spent Muted:** \`${formatDuration(merged.timeMuted / 1000)}\``),
                (textDisplay) =>
                    textDisplay.setContent(`**Time Spent Deafened:** \`${formatDuration(merged.timeDeafened / 1000)}\``),
            );

        interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
    },

    cooldown: 3,
} satisfies Command;

async function getVoiceStatsRow(userId: string) {
    return await getDb().select().from(voiceStats).where(eq(voiceStats.userId, userId));
}

function mergeStats(stats: typeof voiceStats.$inferSelect, userId: string) {
    const session = voiceStore.get(userId);
    if (!session) return stats;

    const now = Date.now();

    stats.timeInVoice = stats.timeInVoice + (now - session.joinedAt);
    stats.timeMuted = stats.timeMuted + (session.timeMuted + (session.mutedAt ? now - session.mutedAt : 0));
    stats.timeDeafened = stats.timeDeafened + (session.timeDeafened + (session.deafenedAt ? now - session.deafenedAt : 0));
    stats.updatedAt = now;

    return stats;
}

import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandSubcommandBuilder, escapeMarkdown } from "discord.js";
import { db } from "@/database/database.js";
import { voiceStats } from "@/database/schema.js";
import { desc } from "drizzle-orm";

type VoiceLeaderboardType = "vc" | "deaf" | "mute";

const leaderboardMap = {
    vc: {
        label: "Time in Voice",
        column: voiceStats.timeInVoice,
    },
    deaf: {
        label: "Time Deafened",
        column: voiceStats.timeDeafened,
    },
    mute: {
        label: "Time Muted",
        column: voiceStats.timeMuted,
    },
}

export default {
    subcommand: new SlashCommandSubcommandBuilder()
        .setName("voice")
        .setDescription("Voice leaderboards")
        .addStringOption((option) =>
            option
                .setName("sort")
                .setDescription("Choose how to sort this leaderboard")
                .setRequired(true)
                .addChoices(
                    { name: "Time in Voice", value: "vc" },
                    { name: "Time Deafened", value: "deaf" },
                    { name: "Time Muted", value: "mute" },
                )),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const type = interaction.options.getString("sort", true) as VoiceLeaderboardType
        const leaderboard = await getVoiceLeaderboard(type);

        if (leaderboard.length === 0) {
            interaction.followUp({
                content: "No voice data has been collected :("
            })
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${leaderboardMap[type].label} Leaderboard`)

        for (const row of leaderboard) {
            embed.addFields(
                { name: escapeMarkdown(row.username), value: formatDuration(row.stat / 1000) }
            )
        }

        interaction.followUp({
            embeds: [embed]
        })
    }
}

async function getVoiceLeaderboard(type: VoiceLeaderboardType) {
    const map = leaderboardMap[type];

    return await db
        .select({
            stat: map.column,
            username: voiceStats.username
        })
        .from(voiceStats)
        .orderBy(desc(map.column))
        .limit(10);
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = (seconds % 60).toFixed(0);

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}
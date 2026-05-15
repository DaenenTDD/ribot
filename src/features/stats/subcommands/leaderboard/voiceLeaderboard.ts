import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, escapeMarkdown } from "discord.js";
import { db } from "@/database/database.js";
import { voiceStats } from "@/database/schema.js";
import { voiceStore } from "../../voiceStore.js";
import type { VoiceSession } from "@/types/voiceSession.js";
import { formatDuration } from "@/core/lib/formatDuration.js";

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

        const leaderboard = await getLeaderboard(type);

        if (leaderboard.length === 0) {
            interaction.followUp({
                content: "No data has been collected for that statistic :("
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

async function getLeaderboard(type: VoiceLeaderboardType) {
    const rows = await getDatabaseRows(type);
    const merged = rows.map(row => mergeLiveStats(row, type));

    for (const [userId, session] of voiceStore) {
        if (!merged.some(r => r.userId === userId)) {
            merged.push(getLiveRow(userId, session, type))
        }
    }

    return merged.sort((a, b) => b.stat - a.stat).slice(0, 10);
}

async function getDatabaseRows(type: VoiceLeaderboardType) {
    const map = leaderboardMap[type];

    return await db
        .select({
            userId: voiceStats.userId,
            username: voiceStats.username,
            stat: map.column,
        })
        .from(voiceStats);
}

function mergeLiveStats(row: { userId: string, username: string, stat: number }, type: VoiceLeaderboardType) {
    const session = voiceStore.get(row.userId);
    if (!session) return row;

    const now = Date.now();
    let extra = 0

    switch (type) {
        case "vc":
            extra = now - session.joinedAt;
            break;
        case "deaf":
            extra = session.timeDeafened + (session.deafenedAt ? now - session.deafenedAt : 0);
            break;
        case "mute":
            extra = session.timeMuted + (session.mutedAt ? now - session.mutedAt : 0);
            break;
    }

    return { ...row, stat: row.stat + extra };
}

function getLiveRow(userId: string, session: VoiceSession, type: VoiceLeaderboardType) {
    const now = Date.now();
    let stat = 0;

    switch (type) {
        case "vc":
            stat = now - session.joinedAt;
            break;
        case "deaf":
            stat = session.timeDeafened + (session.deafenedAt ? now - session.deafenedAt : 0);
            break;
        case "mute":
            stat = session.timeMuted + (session.mutedAt ? now - session.mutedAt : 0);
            break;
    }

    return { userId, username: session.username, stat };
}

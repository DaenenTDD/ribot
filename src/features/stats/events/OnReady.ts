import type { Event } from "@/types/event.js";
import logger from "@/utils/logger.js";
import { Events, Client, ChannelType, VoiceState } from "discord.js";
import { voiceStore } from "../voiceStore.js";


export default {
    event: Events.ClientReady,
    async execute(client: Client) {
        const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)
        const channels = guild.channels.cache;

        const now = Date.now();

        for (const channel of channels) {
            if (channel[1].type === ChannelType.GuildVoice) {
                for (const member of channel[1].members) {
                    const voiceState: VoiceState = member[1].voice;

                    voiceStore.set(member[1].id, {
                        username: member[1].user.username,
                        joinedAt: now,
                        deafenedAt: voiceState.selfDeaf ? now : null,
                        mutedAt: voiceState.selfMute ? now : null,
                        timeMuted: 0,
                        timeDeafened: 0
                    })
                }
            }
        }
    }
} satisfies Event
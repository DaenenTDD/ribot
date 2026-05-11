import { Events, type VoiceState } from "discord.js";
import { voiceStore } from "@/features/stats/voiceStore.js";
import type { Event } from "@/types/event.js";
import logger from "@/utils/logger.js";

export default {
    event: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState) {
        if (!newState.channel && !voiceStore.has(newState.id)) return;
        const userId = newState.id;

        const justDeafened = !oldState.selfDeaf && newState.selfDeaf;
        const justMuted = !oldState.selfMute && newState.selfMute;

        const justUndeafened = oldState.selfDeaf && !newState.selfDeaf;
        const justUnmuted = oldState.selfMute && !newState.selfMute;

        const now = Date.now();
        if (!oldState.channel) {
            voiceStore.set(newState.id, {
                joinedAt: now,
                deafenedAt: newState.selfDeaf ? now : null,
                mutedAt: newState.selfMute ? now : null,
                timeDeafened: 0,
                timeMuted: 0,
            });
            return;
        }
        const session = voiceStore.get(userId);

        if (!session) {
            logger.error(
                `Tried getting voice session for ${newState.member?.user.tag} (${userId}) but it was not found`,
            );
            return;
        }

        if (justDeafened) {
            session.deafenedAt = now;
        }

        if (justMuted) {
            session.mutedAt = now;
        }

        if (justUndeafened && session.deafenedAt) {
            session.timeDeafened += now - session.deafenedAt;
            session.deafenedAt = null;
        }

        if (justUnmuted && session.mutedAt) {
            session.timeMuted += now - session.mutedAt;
            session.mutedAt = null;
        }

        if (!newState.channel) {
            if (newState.selfDeaf) {
                session.timeDeafened += now - session.deafenedAt!;
                session.deafenedAt = null;
            }

            if (newState.selfMute) {
                session.timeMuted += now - session.mutedAt!;
                session.mutedAt = null;
            }

            console.log(
                `${newState.member?.displayName} was deafened for ${session.timeDeafened / 1000} seconds!`,
            );
            voiceStore.delete(newState.id);
        }
    },
} satisfies Event;

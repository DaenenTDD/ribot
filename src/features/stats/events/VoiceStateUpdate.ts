import { Events, type VoiceState } from "discord.js";
import { voiceStore } from "@/features/stats/voiceStore.js";
import type { Event } from "@/types/event.js";
import logger from "@/utils/logger.js";
import { getDb } from "@/database/database.js";
import { voiceStats } from "@/database/schema.js";
import { sql } from "drizzle-orm";

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
            logger.debug(`Creating new voice session for ${userId}`)
            voiceStore.set(newState.id, {
                username: newState.member!.user.username,
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

            const stats: typeof voiceStats.$inferInsert = {
                userId: userId,
                username: newState.member!.user.username,
                timeInVoice: now - session.joinedAt,
                timeDeafened: session.timeDeafened,
                timeMuted: session.timeMuted,
                updatedAt: now,
            }

            try {
                await getDb().insert(voiceStats).values(stats).onConflictDoUpdate({
                    target: voiceStats.userId,
                    set: {
                        username: newState.member!.user.username,
                        timeInVoice: sql`${voiceStats.timeInVoice} + ${now - session.joinedAt}`,
                        timeDeafened: sql`${voiceStats.timeDeafened} + ${session.timeDeafened}`,
                        timeMuted: sql`${voiceStats.timeMuted} + ${session.timeMuted}`,
                        updatedAt: now
                    }
                });
                logger.debug(`Saved session for ${userId}`);
            } catch (error) {
                logger.error(`Error saving session for ${userId}: ${error}`);
            } finally {
                voiceStore.delete(newState.id);
                logger.debug(`Removed session for ${userId}`);
            }
        }
    },
} satisfies Event;

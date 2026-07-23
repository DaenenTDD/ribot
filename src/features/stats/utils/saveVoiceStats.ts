import logger from "@/utils/logger.js";
import { voiceStore } from "../voiceStore.js";
import { getDb } from "@/database/database.js";
import { voiceStats } from "@/database/schema.js";
import { eq, sql } from "drizzle-orm";

/**
 * This function saves a users voice session and resets the accumulators.
 * @param userId The ID of the user to save voice stats for.
 * @param username The username to associate with that ID.
 */
export async function saveVoiceStats(
    userId: string,
    username: string,
): Promise<void> {
    const now = Date.now();
    const session = voiceStore.get(userId);

    if (!session) {
        logger.warn(
            `Tried saving voice stats for ${userId} but they didn't have a session.`,
        );
        return;
    }

    if (!session.lastSave) {
        const stats: typeof voiceStats.$inferInsert = {
            userId: userId,
            username,
            timeInVoice: now - session.joinedAt,
            timeDeafened: session.timeDeafened,
            timeMuted: session.timeMuted,
            updatedAt: now,
        };

        try {
            await getDb()
                .insert(voiceStats)
                .values(stats)
                .onConflictDoUpdate({
                    target: voiceStats.userId,
                    set: {
                        username,
                        timeInVoice: sql`${voiceStats.timeInVoice} + ${now - session.joinedAt}`,
                        timeDeafened: sql`${voiceStats.timeDeafened} + ${session.timeDeafened + (session.deafenedAt ? now - session.deafenedAt : 0)}`,
                        timeMuted: sql`${voiceStats.timeMuted} + ${session.timeMuted + (session.mutedAt ? now - session.mutedAt : 0)}`,
                        updatedAt: now,
                    },
                });
            session.lastSave = now;
            session.timeDeafened = 0;
            session.timeMuted = 0;
            logger.debug(`Saved session for ${userId}`);
        } catch (error) {
            logger.error(
                `Error with the first save of voice session for ${userId}: ${error}`,
            );
        }
    } else {
        try {
            await getDb()
                .update(voiceStats)
                .set({
                    username,
                    timeInVoice: sql`${voiceStats.timeInVoice} + ${now - session.lastSave}`,
                    timeDeafened: sql`${voiceStats.timeDeafened} + ${session.timeDeafened + (session.deafenedAt ? now - session.deafenedAt : 0)}`,
                    timeMuted: sql`${voiceStats.timeMuted} + ${session.timeMuted + (session.mutedAt ? now - session.mutedAt : 0)}`,
                    updatedAt: now,
                })
                .where(eq(voiceStats.userId, userId));

            session.lastSave = now;
            session.timeDeafened = 0;
            session.timeMuted = 0;
        } catch (error) {
            logger.error(
                `Error saving previously saved voice session for ${userId}: ${error}`,
            );
        }
    }
}

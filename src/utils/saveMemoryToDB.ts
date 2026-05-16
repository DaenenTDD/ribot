import { db } from "@/database/database.js";
import { voiceStats } from "@/database/schema.js";
import { voiceStore } from "@/features/stats/voiceStore.js";
import { sql } from "drizzle-orm";
import logger from "./logger.js";

export async function saveMemoryToDB(): Promise<void> {
    logger.info("Saving data...")
    const now = Date.now();

    for (const [userId, session] of voiceStore) {
        try {
            const stats: typeof voiceStats.$inferInsert = {
                userId,
                username: session.username,
                timeInVoice: now - session.joinedAt,
                timeDeafened: session.timeDeafened + (session.deafenedAt ? now - session.deafenedAt : 0),
                timeMuted: session.timeMuted + (session.mutedAt ? now - session.mutedAt : 0),
                updatedAt: now,
            }

            await db.insert(voiceStats).values(stats).onConflictDoUpdate({
                target: voiceStats.userId,
                set: {
                    username: session.username,
                    timeInVoice: sql`${voiceStats.timeInVoice} + ${now - session.joinedAt}`,
                    timeDeafened: sql`${voiceStats.timeDeafened} + ${session.timeDeafened + (session.deafenedAt ? now - session.deafenedAt : 0)}`,
                    timeMuted: sql`${voiceStats.timeMuted} + ${session.timeMuted + (session.mutedAt ? now - session.mutedAt : 0)}`,
                    updatedAt: now,
                }
            });
            logger.debug(`Saved voice stats for: ${userId}`)
        } catch (error) {
            logger.error(`Failed to save voice stats for ${userId}: ${error}`)
        }
    }
};
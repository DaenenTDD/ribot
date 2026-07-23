import { voiceStore } from "@/features/stats/voiceStore.js";
import logger from "./logger.js";
import { saveVoiceStats } from "@/features/stats/utils/saveVoiceStats.js";

export async function saveMemoryToDB(): Promise<void> {
    logger.info("Saving data...");
    const now = Date.now();

    for (const [userId, session] of voiceStore) {
        try {
            await saveVoiceStats(userId, session.username);
        } catch (error) {
            logger.error(`Failed to save voice stats for ${userId}: ${error}`);
        }
    }
}

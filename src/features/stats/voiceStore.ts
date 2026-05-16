import type { VoiceSession } from "@/types/voiceSession.js";
import logger from "@/utils/logger.js";

logger.debug("Creating a new in memory voice store");
export const voiceStore = new Map<string, VoiceSession>();

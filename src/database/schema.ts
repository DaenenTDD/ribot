import { text, int, sqliteTable } from "drizzle-orm/sqlite-core";

export const voiceStats = sqliteTable("voice_stats", {
    userId: text("user_id").primaryKey(),
    username: text("username").notNull(),
    timeInVoice: int("time_in_voice").notNull().default(0),
    timeDeafened: int("time_deafened").notNull().default(0),
    timeMuted: int("time_muted").notNull().default(0),
    updatedAt: int("updated_at").notNull(),
});

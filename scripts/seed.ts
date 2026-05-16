import initEnv from "@/core/lib/initEnv.js";
initEnv();

import { seed } from "drizzle-seed";
import { voiceStats } from "@/database/schema.js";
const { getDb(): db } = await import("@/database/database.js");

await seed(db, { voiceStats }, { count: 40 }).refine((f) => ({
    voiceStats: {
        columns: {
            userId: f.int({
                minValue: 100000000000000,
                maxValue: 10000000000000000,
                isUnique: true,
            }),
            username: f.firstName(),
            timeInVoice: f.int({ minValue: 5_000_000, maxValue: 100_000_000 }),
            timeDeafened: f.int({ minValue: 0, maxValue: 500_000 }),
            timeMuted: f.int({ minValue: 0, maxValue: 750_000 }),
            updatedAt: f.number({
                minValue: 1_748_000_000_000,
                maxValue: 1_778_842_078_000,
                precision: 1,
            }),
        },
    },
}));

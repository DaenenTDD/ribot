import type { Client } from "discord.js";
import type { Job } from "../types/job.js";

// TODO: Automatically save voice stats for all users in the cache
// Also check for users that are in the cache but not in a voice channel (and vice versa) and update the cache accordingly
// This will guard against any missed events (such as a Discord API/Gateway outage or local internet outage).

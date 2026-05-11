import { Events } from "discord.js";

/**
 * An event handler for a Discord event.
 */
export interface Event {
    event: Events;
    once?: boolean;
    execute(...args: any[]): Promise<void>;
}
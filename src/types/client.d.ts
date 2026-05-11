import { Client, Collection } from "discord.js";
import type { Command } from "./command.ts";
import type { Button } from "./button.ts";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>;
        buttons: Collection<string, Button>;
        cooldowns: Collection<string, Collection<string, number>>;
    }
}
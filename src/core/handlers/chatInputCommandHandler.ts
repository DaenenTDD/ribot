import { Collection, MessageFlags, type BaseInteraction } from "discord.js";
import logger from "@/utils/logger.js";

export const chatInputCommandHandler = async (interaction: BaseInteraction): Promise<void> => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    const cooldowns = interaction.client.cooldowns;

    if (!command) {
        logger.error(`No command found for ${interaction.commandName}`);
        await interaction.reply({
            content: "An error occurred while executing this command.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (command.devOnly && process.env.DEV_USER_ID !== interaction.user.id) {
        logger.debug(`User ${interaction.user.tag} (${interaction.user.id}) attempted to use dev-only command ${command.data.name}`);
        await interaction.reply({
            content: "This command is restricted to the bot developer.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (command.cooldown) {
        if (!cooldowns?.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection<string, number>());
            logger.debug(`Creating cooldown collection for command ${command.data.name}`)
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name)
        const cooldownAmount = command.cooldown * 1000;

        if (timestamps?.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
            if (now < expirationTime) {
                logger.debug(`User ${interaction.user.tag} (${interaction.user.id}) is on cooldown for command ${command.data.name}`);
                await interaction.reply({
                    content: `Please wait ${Math.ceil((expirationTime - now) / 1000)} seconds before using this command again.`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        timestamps?.set(interaction.user.id, now);
        setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
    }

    try {
        await command.execute(interaction);
    } catch (error: any) {
        logger.error(`Error executing command ${interaction.commandName}: ${error}`);
        if (interaction.deferred) {
            await interaction.followUp({
                content: "An error occurred while executing this command."
            });
        } else {
            await interaction.reply({
                content: "An error occurred while executing this command.",
                flags: MessageFlags.Ephemeral,
            });
        }
    }
}
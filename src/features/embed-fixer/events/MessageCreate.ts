import { type Event } from "@/types/event.js";
import { Events, type Message } from "discord.js";
import logger from "@/utils/logger.js";

const linksToFix = {
    instagram: {
        name: "Instagram",
        regex: /(?<!<)https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/i,
        build: (...args: string[]) =>
            `https://www.kkinstagram.com/p/${args[0]}/`,
    },
    instagramReels: {
        name: "Instagram reels",
        regex: /(?<!<)https?:\/\/(?:www\.)?instagram\.com\/reels?\/([a-zA-Z0-9_-]+)/i,
        build: (...args: string[]) =>
            `https://www.kkinstagram.com/reel/${args[0]}/`,
    },
    tiktok: {
        name: "TikTok",
        regex: /(?<!<)https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_-]+)\/video\/([0-9]+)/i,
        build: (...args: string[]) =>
            `https://www.kktiktok.com/@${args[0]}/video/${args[1]}/`,
    },
    tiktokShortCode: {
        name: "TikTok",
        regex: /(?<!<)https?:\/\/(?:vt|vm)\.tiktok\.com\/([a-zA-Z0-9]+)\/?/i,
        build: (...args: string[]) => `https://www.kktiktok.com/${args[0]}/`,
    },
};

export default {
    event: Events.MessageCreate,

    async execute(message: Message) {
        if (message.author.bot) return;
        if (!message.channel.isSendable()) return;

        for (const [platform, { name, regex, build }] of Object.entries(
            linksToFix,
        )) {
            const match = message.content.match(regex);
            if (match) {
                logger.debug(
                    `Found ${platform} link in message from ${message.author.tag}: ${match[0]} (${message.id})`,
                );
                const fixedLink = build(...match.slice(1));

                if (fixedLink) {
                    let sentMessage = await message.channel.send(
                        `Hey ${message.author}, I'm attempting to fix your ${name} link so the content can be viewed right here in Discord. ${fixedLink} \n\n_This might not always work. If it didn't, this message will be deleted in 30 seconds._`,
                    );

                    setTimeout(async () => {
                        try {
                            sentMessage = await sentMessage.fetch(true);
                            if (sentMessage.embeds.length === 0) {
                                logger.debug(
                                    `No embed found for fixed message, deleting... (${message.id})`,
                                );
                                await sentMessage.delete();
                            } else {
                                logger.debug(
                                    `Embed found for fixed message, editing... (${message.id})`,
                                );
                                await sentMessage.edit(
                                    `Hey ${message.author}, I fixed your ${name} link so the content can be viewed right here in Discord. ${fixedLink}`,
                                );
                                if ((await message.fetch()).embeds.length > 0) {
                                    await message.suppressEmbeds(true);
                                }
                            }
                        } catch (error) {
                            logger.error(
                                `Error occurred while fetching or editing message: ${error}`,
                            );
                        }
                    }, 30000);
                }
                break;
            }
        }
    },
} satisfies Event;

import { type Event } from "@/types/event.js";
import { Events, type Message } from "discord.js";
import logger from "@/utils/logger.js";

const linksToFix = {
    instagram: {
        regex: /https?:\/\/(?:www\.)?instagram\.com\/reels?\/([a-zA-Z0-9_-]+)/,
        build: (id: String) => `https://www.kkinstagram.com/reel/${id}/`,
    },
};

export default {
    event: Events.MessageCreate,

    async execute(message: Message) {
        if (message.author.bot) return;
        if (!message.channel.isSendable()) return;

        for (const [platform, { regex, build }] of Object.entries(linksToFix)) {
            const match = message.content.match(regex);
            if (match) {
                logger.debug(
                    `Found ${platform} link in message from ${message.author.tag}: ${match[0]}`,
                );
                const fixedLink = build(match[1]!);

                if (fixedLink) {
                    let sentMessage = await message.channel.send(
                        `Hey ${message.author}, I fixed your ${platform} link so the video can be played right here in Discord. ${fixedLink} \n\n_This might not always work. If it didn't, this message will be deleted in 15 seconds._`,
                    );

                    setTimeout(async () => {
                        try {
                            sentMessage = await sentMessage.fetch(true);
                            if (sentMessage.embeds.length === 0) {
                                await sentMessage.delete();
                            } else {
                                await sentMessage.edit(
                                    `Hey ${message.author}, I fixed your ${platform} link so the video can be played right here in Discord. ${fixedLink}`,
                                );
                            }
                        } catch (error) {
                            logger.error(
                                `Error occurred while fetching or editing message: ${error}`,
                            );
                        }
                    }, 15000);
                }
            }
        }
    },
} satisfies Event;

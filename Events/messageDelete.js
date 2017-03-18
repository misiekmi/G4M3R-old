// Message deleted
module.exports = (bot, db, config, winston, msg) => {
    if (msg && msg.channel.guild && msg.author.id != bot.user.id && !msg.author.bot) {
        // Get server data
        db.servers.findOne({ _id: msg.channel.guild.id }, (err, serverDocument) => {
            if (!err && serverDocument) {
                // Get channel data
                let channelDocument = serverDocument.channels.id(msg.channel.id);
                // Create channel data if not found
                if (!channelDocument) {
                    serverDocument.channels.push({ _id: msg.channel.id });
                    channelDocument = serverDocument.channels.id(msg.channel.id);
                }

                // Send message_deleted_message if necessary
                if (serverDocument.config.moderation.isEnabled && serverDocument.config.moderation.status_messages.message_deleted_message.isEnabled && serverDocument.config.moderation.status_messages.message_deleted_message.enabled_channel_ids.indexOf(msg.channel.id) > -1 && !channelDocument.isMessageDeletedDisabled) {
                    winston.info(`Message by member '${msg.author.username}' on server '${msg.channel.guild.name}' deleted`, { svrid: msg.channel.guild.id, chid: msg.channel.id, usrid: msg.author.id });

                    // Send message in different channel
                    if (serverDocument.config.moderation.status_messages.message_deleted_message.type == "single" && serverDocument.config.moderation.status_messages.message_deleted_message.channel_id) {
                        const ch = msg.channel.guild.channels.get(serverDocument.config.moderation.status_messages.message_deleted_message.channel_id);
                        if (ch) {
                            const targetChannelDocument = serverDocument.channels.id(ch.id);
                            if (!targetChannelDocument || targetChannelDocument.bot_enabled) {
                                ch.createMessage(`Message by **@${bot.getName(msg.channel.guild, serverDocument, msg.member)}** in #${msg.channel.name} deleted:\n\`\`\`${msg.cleanContent}\`\`\``, { disable_everyone: true });
                            }
                        }
                        // Send message in same channel
                    } else if (serverDocument.config.moderation.status_messages.message_deleted_message.type == "msg") {
                        if (!channelDocument || channelDocument.bot_enabled) {
                            msg.channel.createMessage(`Message by **@${bot.getName(msg.channel.guild, serverDocument, msg.member)}** deleted:\n\`\`\`${msg.cleanContent}\`\`\``, { disable_everyone: true });
                        }
                    }
                }
            } else {
                winston.error("Failed to find server data for messageDeleted", { svrid: msg.channel.guild.id, chid: msg.channel.id, usrid: msg.author.id }, err);
            }
        });
    }
};
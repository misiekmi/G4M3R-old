const getGIF = require("./../../Modules/GiphySearch.js");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
    if(suffix) {
        getGIF(suffix, (serverDocument.config.moderation.isEnabled && serverDocument.config.moderation.filters.nsfw_filter.isEnabled && serverDocument.config.moderation.filters.nsfw_filter.disabled_channel_ids.indexOf(msg.channel.id) == -1) ? "pg-13" : "r", function(url) {
            if(url) {
                msg.channel.createMessage(url);
            } else {
                winston.warn(`No GIFs found for '${suffix}'`, {svrid: msg.channel.guild.id, chid: msg.channel.id, usrid: msg.author.id});
                msg.channel.createMessage("The Internet has run out of memes **(╯°□°）╯︵ ┻━┻**");
            }
        });
    } else {
        msg.channel.createMessage(`How am I able to guess what GIF you want? Please use the syntax \`` +
                                    `${bot.getCommandPrefix(msg.channel.guild, serverDocument)}${commandData.name} <terms to search>\``);
    }
};

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
    let description = "";
    if (suffix) {
        description += `\`\`\`${suffix}\`\`\``
    }
    let embed = {
        embed: {
            author: {
                name: bot.user.username,
                icon_url: bot.user.avatarURL,
                url: "https://github.com/pedall/G4M3R"
            },
            color: 0x00FF00,
            title: `**@${msg.author.username}** send an alert in #${msg.channel.name} on ${msg.guild.name}${(suffix != "" ? ":" : "")}`,
            description: description
        }
    };
    bot.messageBotAdmins(msg.guild, serverDocument, embed);
    msg.channel.createMessage("The admins have been alerted! ⚠");
};
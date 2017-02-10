module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
    let strTitle = "";

    if (suffix && ["bugs", "suggestions", "features", "issues"].indexOf(suffix.toLowerCase()) > -1) {

        let strDesc = `🐜 Please file your ${suffix.toLowerCase()} here: https://github.com/pedall/G4M3R/issues`;

        msg.channel.createMessage({
            embed: {
                author: {

                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R/issues"
                },
                color: 0x9ECDF2,
                title: "Suggestions / Issues / bugs / feature requests for G4M3R",
                description: strDesc
            }
        });

    } else {

        let strTitle = `Hi, I'm **G4M3R**, a discord bot for gaming communities by pedall and notem! 🎮`;
        let strDesc = `\nUse \`${bot.getCommandPrefix(msg.guild, serverDocument)}help\` to list all commands.` +
            `\n\nGo to <${config.hosting_url}> to learn more\nJoin our Discord server: <${config.discord_link}> to get more information.`;
        let strFooter = `This bot is based on **AwesomeBot** by BitQuote as well as the continued **GAwesomeBot** by GG142.`;

        msg.channel.createMessage({
            embed: {
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R"
                },
                color: 0x2ee1e4,
                title: strTitle,
                description: strDesc,
                footer: {
                    text: strFooter
                }
            }
        });

    }
};
module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
    let strOutput = "";

    if (suffix && ["bugs", "suggestions", "features", "issues"].indexOf(suffix.toLowerCase()) > -1) {

        //let strDesc = `🐜 Please file your ${suffix.toLowerCase()} here: https://github.com/pedall/G4M3R/issues`;
        strOutput += `▶▶ **Please file your ${suffix.toLowerCase()} here: https://github.com/pedall/G4M3R/issues **`;

        msg.channel.createMessage(strOutput);
        /*        msg.channel.createMessage({
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
        */
    } else {
        let strOutput = "";

        strOutput += `Hi, I am **G4M3R**, a discord bot by \`pedall\` and \`notem\` 🎮\n\n`;
        strOutput += `I have tons of special features like my __**events and notification system**__!\n`;
        strOutput += `Use \`${bot.getCommandPrefix(msg.guild, serverDocument)}help\` to get a PM with further instructions.\n\n`;
        strOutput += `**>>** Visit the bot's **web dashboard <${config.hosting_url}>** to setup your server.\n`
        strOutput += `**>>** Need more support? Join **<${config.discord_link}>** and ask us directly\n\n`;
        strOutput += `**>>** This bot is based on __AwesomeBot__ by *[BitQuote]* and __GAwesomeBot__ by *[GG142]*\n`;

        msg.channel.createMessage(strOutput);
        /*        msg.channel.createMessage({
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
        */
    }
};
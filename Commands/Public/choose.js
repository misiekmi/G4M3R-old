module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
	const choices = suffix.split("|");
	if(suffix && choices.length >= 2) {
		msg.channel.createMessage({
			embed: {
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R"
                },
                color: 0x00FF00,
				title: "I choose:",
				description: choices.random()
			}
		});
	} else {
		winston.warn(`Invalid parameters '${suffix}' provided for ${commandData.name} command`, {svrid: msg.guild.id, chid: msg.channel.id, usrid: msg.author.id});
		msg.channel.createMessage({
			embed: {
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R"
                },
                color: 0xFF0000,
				description: `🤔 I didn't quite get that. Make sure to use the syntax \`${bot.getCommandPrefix(msg.guild, serverDocument)}${commandData.name} ${commandData.usage}\``
			}
		});
	}
};
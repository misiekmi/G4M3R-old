module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
let strTitle = "";

	if(suffix && ["bug", "suggestion", "feature", "issue"].indexOf(suffix.toLowerCase())>-1) {

		strTitle = `🐜 Please file your ${suffix.toLowerCase()} here: https://github.com/pedall/G4M3R/issues`

		msg.channel.createMessage({
			embed: {
				author: {
					name: bot.user.username,
					icon_url: bot.user.avatarURL,
					url: "https://github.com/pedall/G4M3R/issues"
				},
				color: 0x9ECDF2,
				title: "Suggestions / Issues / bugs / feature requests for G4M3R",
				description: strTitle
			}
		});


		//msg.channel.createMessage(`🐜 Please file your ${suffix.toLowerCase()} here: https://github.com/pedall/G4M3R/issues`);
	} else {

		let strTitle = `Hello! I'm G4M3R, THE discord bot for gaming communities! \
		🎮 Use \`${bot.getCommandPrefix(msg.guild, serverDocument)}help\` to list \
		commands.\nThis bot is based on **AwesomeBot by BitQuote** as well as the \
		continued **G4M3R by pedall and notem**. Built on NodeJS with Eris. \
		Go to <${config.hosting_url}> to learn more, or join our \
		Discord server: <${config.discord_link}>`

		msg.channel.createMessage({
			embed: {
				author: {
					name: bot.user.username,
					icon_url: bot.user.avatarURL,
					url: "https://github.com/pedall/G4M3R"
				},
				color: 0x9ECDF2,
				title: "Information about G4M3R",
				description: strTitle
			}
		});

		//msg.channel.createMessage(`Hello! I'm G4M3R, THE discord bot for gaming communities! 🎮 Use \`${bot.getCommandPrefix(msg.guild, serverDocument)}help\` to list commands.\nThis bot is based on **AwesomeBot by BitQuote** as well as the continued **G4M3R by pedall and notem**. Built on NodeJS with Eris. Go to <${config.hosting_url}> to learn more, or join our Discord server: <${config.discord_link}>`);

	}
};

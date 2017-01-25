module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
let strTitle = "https://trello.com/b/qBjbOh48/g4m3r";

		msg.channel.createMessage({
			embed: {
				author: {
					name: bot.user.username,
					icon_url: bot.user.avatarURL,
					url: "https://github.com/pedall/G4M3R/issues"
				},
				color: 0x9ECDF2,
				title: "Trello for G4M3R",
				description: strTitle
			}
		});
};

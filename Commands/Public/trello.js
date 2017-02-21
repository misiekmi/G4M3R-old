module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
let strLink = "https://trello.com/b/qBjbOh48/g4m3r";

		msg.channel.createMessage({
			embed: {
				author: {
					name: "Trello for G4M3R",
					icon_url: "http://frid.li/YaBD2",
					url: "https://github.com/pedall/G4M3R/issues"
				},
				color: 0x9ECDF2,
				title: "Please look here for already noted ideas / suggestions / bugs",
				description: strLink,
				thumbnail: {
					url: "http://frid.li/YaBD2"
				}
			}
		});
};

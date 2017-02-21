const unirest = require("unirest");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
	let num = suffix;
	if(!num) {
		num = 1;
	}
	if(isNaN(num) || num < 1 || num > serverDocument.config.command_fetch_properties.max_count) {
		num = serverDocument.config.command_fetch_properties.default_count;
	}
	unirest.get(`http://catfacts-api.appspot.com/api/facts?number=${num}`).header("Accept", "application/json").end(res => {
		if(res.status == 200) {
			msg.channel.createMessage({
				embed: {
                    author: {
                        name: "Did you know THAT fact about cats?",
                        icon_url: bot.user.avatarURL,
                        url: "https://github.com/pedall/G4M3R"
                    },
                    color: 0x00FF00,
					description: JSON.parse(res.body).facts.toString(),
					thumbnail: {
						url: "http://frid.li/uBqJb"
					}
				}
			});
		} else {
			winston.error("Failed to fetch cat fact(s)", {svrid: msg.guild.id, chid: msg.channel.id, usrid: msg.author.id});
			msg.channel.createMessage({
				embed: {
                    author: {
                        name: "cat lover",
                        icon_url: "http://frid.li/uBqJb",
                        url: "https://github.com/pedall/G4M3R"
                    },
                    color: 0x9ECDF2,
					description: "Cats exist and are cute af. 😻"
				}
			});
		}
	});
};

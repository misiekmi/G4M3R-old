const os = require("os");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg) => {

    //if(config.maintainers.indexOf(msg.author.id)> -1 ) {

	    let upTime = Math.round(process.uptime()); //.split(".");
	    //let upTimeSeconds = upTime.split(".");
	    let upTimeOutput = "";

        if (upTime<60) {
            upTimeOutput = `${upTime}s`;
        } else if (upTime<3600) {
	        upTimeOutput = `${Math.floor(upTime/60)}m ${upTime%60}s`;
        } else if (upTime<86400) {
	        upTimeOutput = `${Math.floor(upTime/3600)}h ${Math.floor(upTime%3600/60)}m ${upTime%3600%60}s`;
        } else if (upTime<604800) {
	        upTimeOutput = `${Math.floor(upTime/86400)}w ${Math.floor(upTime%86400/3600)}h ${Math.floor(upTime%86400%3600/60)}m ${upTime%86400%3600%60}s`;
        }

		let embed_fields = [{
                name: "System info:",
                value: `${process.platform}-${process.arch} with ${process.release.name} version ${process.version.slice(1)}`,
                inline: true
		    },
			{
				name: "Process info: PID",
				value: `${process.pid}`,
				inline: true
			},
			{
				name: "Process memory usage:",
				value: `${Math.ceil(process.memoryUsage().heapTotal / 1000000)} MB`,
				inline: true
			},
			{
				name: "System memory usage:",
				value: `${Math.ceil((os.totalmem() - os.freemem()) / 1000000)} of ${Math.ceil(os.totalmem() / 1000000)} MB`,
				inline: true
			},
			{
				name: "Bot info:",
				value: `:id: ${bot.user.id} :hash:${bot.user.discriminator}`,
				inline: true
			},
			{
				name: "Uptime:",
				value: `${upTimeOutput}`,
				inline: true
			}
		];

		msg.channel.createMessage({
			embed: {
				author: {
					name: bot.user.username,
					icon_url: bot.user.avatarURL,
					url: "https://github.com/pedall/G4M3R"
				},
				color: 0x00FF00,
				fields: embed_fields
			}
		});
/*
	} else {
		msg.channel.createMessage({
			embed: {
				author: {
					name: bot.user.username,
					icon_url: bot.user.avatarURL,
					url: "https://github.com/pedall/G4M3R"
				},
				color: 0x00FF00,
				description: "Sorry, this command is for bot maintainers only 😅"
			}
		});
	}
*/
};

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
        if (suffix) {
            const getCommandHelp = (name, type, usage, description) => {

                    return `__Help for ${type} command **${name}**__\n${description ? (`Description: ${description}\n`) : ""}${usage ? (`Usage: \`${usage}\`\n`) : ""}<${config.hosting_url}wiki/Commands#${name}>`;

		};

		const info = [];
		const pmcommand = bot.getPMCommandMetadata(suffix);
		if(pmcommand) {
			info.push(getCommandHelp(suffix, "PM", pmcommand.usage));
		}
		const publiccommand = bot.getPublicCommandMetadata(suffix);
		if(publiccommand) {
			info.push(getCommandHelp(suffix, "public", publiccommand.usage, publiccommand.description));
		}
	
		if(info.length==0) {
			info.push(`No such command \`${suffix}\``);
		}
		bot.sendArray(msg.channel, info);
	} else {
		//msg.channel.createMessage(`${msg.author.mention} Check your PMs.`);

		const preInfo = `## **PUBLIC COMMANDS** to use with prefix \`${bot.getCommandPrefix(msg.guild, serverDocument)}\`.` +
		 `\n*## Only showing commands you have permission to use.*\n`;
		const afterInfo =  `*## For a list of private commands, pm me the text \`help\`.*`;
		
		const commands = {};
		let embed_name = "";
		let embed_value = "";
		let embed_fields = [];
		let embed_author = {
			name: bot.user.username,
			icon_url: bot.user.avatarURL,
			url: "https://github.com/pedall/G4M3R"
		};

		const memberBotAdmin = bot.getUserBotAdmin(msg.guild, serverDocument, msg.member);
		bot.getPublicCommandList().forEach(command => {
			if(serverDocument.config.commands[command] && serverDocument.config.commands[command].isEnabled && memberBotAdmin>=serverDocument.config.commands[command].admin_level) {
				const commandData = bot.getPublicCommandMetadata(command);
				if(!commands[commandData.category]) {
					commands[commandData.category] = [];
				}
				commands[commandData.category].push(`\`${command}\``);
			}
		});
		Object.keys(commands).sort().forEach(category => {
			//info.push(`**${category}** ${commands[category].sort().join(" ")}`);
			embed_name = `${category}`;
			embed_value = `${commands[category].sort().join(" ")}`;
			embed_fields.push({
				name: embed_name,
				value: embed_value,
				inline: false
			});

		});
		//TODO Change Wiki URL
		let embed_footer = `For detailed information about each command and all of G4M3R's other features, head over to our wiki: <${config.hosting_url}wiki/Commands>. If you need support using G4M3R, please join our Discord server: <${config.discord_link}>. 🎮`;
		
		msg.channel.createMessage(preInfo);
		msg.channel.createMessage({			
			embed : {
				author: {
					name: bot.user.username + ` | PUBLIC COMMANDS`,
					icon_url: bot.user.avatarURL,
					url: "https://github.com/pedall/G4M3R"
				},
				color: 0xffffff,
				fields: embed_fields,
				footer: {
					text: `type '${bot.getCommandPrefix(msg.guild, serverDocument)}help <commandName>' to get more details`
				}
			}
		});
		msg.channel.createMessage(afterInfo);
		
		 
		/* backup for help message
		msg.author.getDMChannel().then(ch => {
				bot.sendArray(ch, info);
			});
		}
		*/
	}
};
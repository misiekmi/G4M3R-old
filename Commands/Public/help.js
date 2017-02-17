module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
        if (suffix) {

            const getCommandHelp = (name, type, usage, description, examples) => {
                    let title_content, page_content, footer_content;
                    let embed_author = {
                        name: bot.user.username + ` >>> Help for ${type} command [${name}]`,
                        icon_url: bot.user.avatarURL,
                        url: "https://github.com/pedall/G4M3R"
                    };

                    msg_color = 0xffffff; //white color
                    title_content = ``;
                    page_content = `${description ? (`**Description:** *${description}*`) : "*no description*"}`;
					page_content += `\n\n${usage ? (`**Usage:** ${bot.getCommandPrefix(msg.guild, serverDocument)}${usage}`) : "*no usage*"}`;
					page_content += `\n${examples ? (`**Examples:** ${examples}`) : "*no example*"}`;
					page_content += `\n**WIKI Link:** <${config.hosting_url}wiki/Commands#${name}>`;

                    
					footer_content = `Please go to the Wiki for more details`;

                    return { embed: { author: embed_author, color: msg_color, description: page_content, footer: { text: footer_content } } };


/*                    return `__Help for ${type} command **${name}**__\n${description ? (`Description: ${description}\n`) : ""}
					${usage ? (`Usage: \`${usage}\`\n`) : ""}<${config.hosting_url}wiki/Commands#${name}>`;
*/
		};

		const info = [];
		const pmcommand = bot.getPMCommandMetadata(suffix);
		if(pmcommand) {
			info.push(getCommandHelp(suffix, "PM", pmcommand.usage));
		}
		const publiccommand = bot.getPublicCommandMetadata(suffix);
		if(publiccommand) {
			info.push(getCommandHelp(suffix, "public", publiccommand.usage, publiccommand.description, publiccommand.examples));
		}
	
		if(info.length==0) {
			info.push(`No such command \`${suffix}\``);
		}
		bot.sendArray(msg.channel, info);
	} else {
		let description = `**Hi <@${msg.author.id}>!** \n 
		On your server \`${msg.guild.name}\` the bot's prefix is set to \`${bot.getCommandPrefix(msg.guild, serverDocument)}\`.\n 
		**To get an overview over my public commands just type:**\n
		\`commands\` *(to get all command categories)*\n
		\`commands [category]\` *(don't type the whole name 😅)*\n
		\`commands all\` *(to get all commands at once)*\n\n 

		**##** I will only show commands you have permission to use.\n 
		**##** For a list of commands you can use right here, just repsonse \`help\`.\n
		**##** For detailed information visi our wiki [here](${config.hosting_url}wiki/Commands).\n
		**##** To get some support, please join our Discord server [here](${config.discord_link}).`;

        msg.author.getDMChannel().then(ch => {
            ch.createMessage({
                embed: {
                    author: {
                        name: bot.user.username,
                        icon_url: bot.user.avatarURL,
                        url: "https://github.com/GilbertGobbels/GAwesomeBot"
                    },
                    color: 0x00FF00,
                    description: description
                }
            });
        });	
	}
};
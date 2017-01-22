module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
this.eTitle = "test";
this.eContent = "bla";
this.isCommand = true,
this.isLocked = false;
//this._id = "bla";


	winston.info("Event command triggered", {svrid: msg.guild.id, chid: msg.channel.id, usrid: msg.author.id});
	msg.channel.createMessage("Event command triggered");

		msg.channel.createMessage("What is the title or your event?").then(() => {
			bot.awaitMessage(msg.channel.id, msg.author.id, message => {
					this.eTitle = message.content.trim();

					msg.channel.createMessage(`**Your event:**\n\`\`\`\nTitle: ${this.eTitle}\nhas been saved successfully\`\`\``);

					this.save = () => {
						serverDocument.config.tags.list.push({
							_id: this.eTitle,
							content: this.eContent,
							isCommand: this.isCommand,
							isLocked: this.isLocked
						});
					};

					this.save();
					/*
					serverDocument.gameEvents.push({
						e_title: this.eTitle
					});
					*/

			});
		});
};

/*
		this.list = () => {
			const gevents = serverDocument.config.gevent.map(eve => {
				return `**${eve.event_title}**`;
			});
*/

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
    let title, start;

    msg.channel.createMessage("What is the title the event?").then(() => {
        bot.awaitMessage(msg.channel.id, msg.author.id, message => {
            title = message.content.trim();

            msg.channel.createMessage("When does the event start?").then(() => {
                bot.awaitMessage(msg.channel.id, msg.author.id, message => {
                    start = Date.now();

                    serverDocument.gameEvents.push({e_title: title, start: start}); // create event, push it to gameEvents

                    serverDocument.save(err => {    // 'save' the server and handle error
                        if(err) {
                            winston.error("Failed to save server data for message", {svrid: msg.guild.id}, err);
                        }
                    });

                    msg.channel.createMessage(`**Your event:**\n\`\`\`\nTitle: ${title}\nStart: ${start}\nhas been saved successfully\`\`\``);
                });
            });
        });
    });
};

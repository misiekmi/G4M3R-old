module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
    let title, start;

    msg.channel.createMessage("What is the title the event?").then(() => {
        bot.awaitMessage(msg.channel.id, msg.author.id, message => {
            title = message.content.trim();

            msg.channel.createMessage("When does the event start?").then(() => {
                bot.awaitMessage(msg.channel.id, msg.author.id, message => {
                    start = Date.now();

                    if (!title)
                        title = "(no title)";

                    serverDocument.gameEvents.push({
                        e_title: title,
                        start: start
                    });

                    msg.channel.createMessage(`**Your event:**\n\`\`\`\nTitle: ${title}\nStart: ${start}\nhas been saved successfully\`\`\``);
                });
            });
        });
    });
}

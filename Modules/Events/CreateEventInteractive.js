const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    let title, start, end, description, amountMembers;

    // for format options, reference: http://momentjs.com/docs/#/parsing/string-format/
    const formats = [ "YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];

    // message prompt for title
    msg.channel.createMessage("What is the title the event?").then(bot_message => {
        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

            title = usr_message.content.trim();
            if (hasDeletePerm)
                bot_message.delete().then(() => usr_message.delete());

            // message prompt for start date time
            msg.channel.createMessage("When does the event start? <\YYYY/MM/DD h:mm>").then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                    start = moment(usr_message.content.trim(), formats, true);     // parse start time
                    if (hasDeletePerm)
                        bot_message.delete().then(() => usr_message.delete());

                    if (start.isValid())
                        // message prompt for end date time
                        msg.channel.createMessage("When does the event end? <\YYYY/MM/DD h:mm>").then(bot_message => {
                            bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                                end = moment(usr_message.content.trim(), formats, true);     // parse start time
                                if (hasDeletePerm)
                                    bot_message.delete().then(() => usr_message.delete());

                                if (end.isValid())
                                    // message prompt for end date time
                                    msg.channel.createMessage("Can you give a description of the event").then(bot_message => {
                                        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                                            description = usr_message.content.trim();
                                            bot_message.delete().then(() => usr_message.delete());

                                            serverDocument.gameEvents.push({
                                                title: title,
                                                start: start,
                                                end: end,
                                                description: description
                                            }); // create event, push it to gameEvents
                                            serverDocument.save(err => {    // 'save' the server and handle error
                                                if (err) {
                                                    winston.error("Failed to save server data for message", {svrid: msg.guild.id}, err);
                                                    msg.channel.createMessage("Something went wrong! I failed to save your event. It's my dev's fault!");
                                                }
                                                else {
                                                    msg.channel.createMessage(
                                                        `**Your event:**\n\`\`\`\n` +
                                                        `Title: ${title}` +
                                                        `\nStart: ${start.toString()}` +
                                                        `\nEnd: ${end.toString()}` +
                                                        `\nDescription: ${description}\`\`\`` +
                                                        `**has been saved successfully**`);
                                                }
                                            });
                                        });
                                    });
                                else
                                    msg.channel.createMessage("I couldn't understand that date and time message. Exiting interactive");
                            });
                        });
                    else
                        msg.channel.createMessage("I couldn't understand that date and time message. Exiting interactive");
                });
            });
        });
    });
};

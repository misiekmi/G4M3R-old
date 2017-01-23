const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg) => {
    let title, start, end, description;

    msg.channel.createMessage("What is the title the event?").then(bot_message => {
        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

            title = usr_message.content.trim();
            bot_message.delete().then( () => usr_message.delete() );

            msg.channel.createMessage("When does the event start?").then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                    start = moment(usr_message.content.trim());     // parse start time
                    bot_message.delete().then( () => usr_message.delete() );

                    msg.channel.createMessage("When does the event end?").then(bot_message => {
                        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                            end = moment(usr_message.content.trim());     // parse start time
                            bot_message.delete().then( () => usr_message.delete() );

                            msg.channel.createMessage("Can you give a description of the event").then(bot_message => {
                                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                                    description = usr_message.content.trim();
                                    bot_message.delete().then( () => usr_message.delete() );

                                    serverDocument.gameEvents.push({title: title, start: start, end: end, description: description}); // create event, push it to gameEvents
                                    serverDocument.save(err => {    // 'save' the server and handle error
                                        if (err) {
                                            winston.error("Failed to save server data for message", {svrid: msg.guild.id}, err);
                                            msg.channel.createMessage("Something went wrong! I failed to save your event.");
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
                        });
                    });
                });
            });
        });
    });
};

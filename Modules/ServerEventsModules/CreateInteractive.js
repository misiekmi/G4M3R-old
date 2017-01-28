const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    let title, start, end, description;
    let skipStart, skipEnd, skipDesc;

    // for format options, reference: http://momentjs.com/docs/#/parsing/string-format/
    const formats = ["YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];

    // message prompt for title
    msg.channel.createMessage("What is the title the event?").then(bot_message => {
        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
            bot.removeMessageListener(msg.channel.id, msg.author.id);

            title = usr_message.content.trim();
            if (hasDeletePerm)
                bot_message.delete().then(() => usr_message.delete());

            // message prompt for start date time
            msg.channel.createMessage("Please enter the start date of the event. (format: <\YYYY/MM/DD h:mm>) or type \`skip\` to continue.").then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    bot.removeMessageListener(msg.channel.id, msg.author.id);

                    start = moment(usr_message.content.trim(), formats, true); // parse start time
                    if (hasDeletePerm)
                        bot_message.delete().then(() => usr_message.delete());

                        if (usr_message.content.trim().toLowerCase() === "skip") {
                            skipStart = true;

                        } else if (start.isValid()) {
                            skipStart = false;

                        } else {
                            if (hasDeletePerm) {
                            bot_message.delete();
                            }
                            msg.channel.createMessage("You did not type \`skip\` or valid date format **<\YYYY/MM/DD h:mm>**. Event creation process exited.");
                            return;
                        }


                        // message prompt for end date time
                        msg.channel.createMessage("Please enter the end date of the event. (format: <\YYYY/MM/DD h:mm>) or type \`skip\` to continue.").then(bot_message => {
                            bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                                bot.removeMessageListener(msg.channel.id, msg.author.id);

                                end = moment(usr_message.content.trim(), formats, true); // parse start time
                                if (hasDeletePerm)
                                    bot_message.delete().then(() => usr_message.delete());

                                    if (usr_message.content.trim().toLowerCase() === "skip") {
                                        skipEnd = true;

                                    } else if (start.isValid()) {
                                        skipEnd = false;

                                    } else {
                                        if (hasDeletePerm) {
                                        bot_message.delete();
                                        }
                                        msg.channel.createMessage("You did not type \`skip\` or valid date format **<\YYYY/MM/DD h:mm>**. Event creation process exited.");
                                        return;
                                    }


                                    // message prompt for end date time
                                    msg.channel.createMessage("Can you give a description of the event").then(bot_message => {
                                        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                                            bot.removeMessageListener(msg.channel.id, msg.author.id);

                                            description = usr_message.content.trim();
                                            bot_message.delete().then(() => usr_message.delete());
                                            let embed_fields = [];

                                            if( skipStart || skipEnd ) {

                                                serverDocument.gameEvents.push({
                                                    title: title,
                                                    description: description
                                                }); // create event, push it to gameEvents

                                                embed_fields = [
                                                    {
                                                        name: "**Title**",
                                                        value: `${title}`,
                                                        inline: true
                                                    },
                                                    {
                                                        name: "**Description**",
                                                        value: `${description}`,
                                                        inline: true
                                                    }];
                                            } else {
                                                serverDocument.gameEvents.push({
                                                    title: title,
                                                    start: start,
                                                    end: end,
                                                    description: description
                                                });

                                                embed_fields = [
                                                    {
                                                        name: "**Title**",
                                                        value: `${title}`,
                                                        inline: true
                                                    },
                                                    {
                                                        name: "**Description**",
                                                        value: `${description}`,
                                                        inline: true
                                                    },
                                                    {
                                                        name: "**Start**",
                                                        value: `${moment(start)}`,
                                                        inline: true
                                                    },
                                                    {
                                                        name: "**End**",
                                                        value: `${moment(end)}`,
                                                        inline: true
                                                    }];
                                            } // create event, push it to gameEvents

                                            serverDocument.save(err => { // 'save' the server and handle error
                                                if (err) {
                                                    winston.error("Failed to save server data for message", {
                                                        svrid: msg.guild.id
                                                    }, err);
                                                    msg.channel.createMessage("Something went wrong! I failed to save your event. It's my dev's fault!");
                                                } else {
                                                     msg.channel.createMessage({
                                                         embed: {
                                                        author: {
                                                            name: "~~ Event successfully created ~~",
                                                        },
                                                        color: 0xffffff,
                                                        fields: embed_fields
                                                    }
                                                });
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

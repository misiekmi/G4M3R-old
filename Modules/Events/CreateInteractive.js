const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    let title = "",
        start, end, description,
        tags = [],
        maxAttendees = 3;
    let skipStart = false;

    // for format options, reference: http://momentjs.com/docs/#/parsing/string-format/
    const formats = ["YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];

    // message prompt for title
    let embedMsg = "",
        embedFooter = "",
        embedTitle = "",
        embedAuthor = "";

    //Define the embed message for title question
    embedAuthor = `Event creation process`;
    embedTitle = 'Please enter any string as title';
    embedMsg = `\n~\n\`# enter 'exit' to quit\``;
    embedFooter = `(maximum of 100 chars)`;

    msg.channel.createMessage({
        embed: {
            author: {
                name: embedAuthor,
                icon_url: bot.user.avatarURL
            },
            color: 0xff8c00,
            title: embedTitle,
            description: embedMsg,
            footer: {
                text: embedFooter
            }
        }
    }).then(bot_message => {
        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

            title = usr_message.content.trim();
            //Check if the entered string is > 2000 (discord max per message) or users want to exit
            if (title.length > 2000 || title === "exit") {
                msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                return;
            }
            //only delete message if bot has the correct rights to do it.
            if (hasDeletePerm) {
                bot_message.delete();
            }


            //Define the embed message for start date question
            embedAuthor = `Event creation process`;
            embedTitle = 'Please enter a start date';
            embedMsg = `\n~\n\`# enter 'skip' to forward\`\n\`# enter 'exit' to quit\`\n`;
            embedFooter = `(Format: <YYYY/MM/DD h:mm>) - default is today`;
            // message prompt for start date time
            msg.channel.createMessage({
                embed: {
                    author: {
                        name: embedAuthor,
                        icon_url: bot.user.avatarURL
                    },
                    color: 0xff8c00,
                    title: embedTitle,
                    description: embedMsg,
                    footer: {
                        text: embedFooter
                    }
                }
            }).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                    start = moment(usr_message.content.trim(), formats, true); // parse start time
                    //let secondStart = moment();
                    
                    //testing differences
                    //msg.channel.createMessage(`${start}`);
                    //msg.channel.createMessage(`${secondStart}`);

                    let usrResponse = usr_message.content.trim().toLowerCase();

                    if (hasDeletePerm) {
                        bot_message.delete();
                    }

                    // If users enters no valid date but a string, check if he wants to exit or its just an unvalid string
                    if (!start.isValid()) {
                        switch (usrResponse) {
                
                            case "exit":
                                msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                                return;
                            case "skip":
                                //TODO tried to store current date if users skips
                                start = moment(new Date(),formats,true);
                                msg.channel.createMessage(`⏩ **Default start date ${start} added!**`);
                                // msg.channel.createMessage(`⏩ **No start date entered!**`);
                                skipStart = true;
                                break;

                            default:
                                msg.channel.createMessage("⚠ **Please enter \`exit\`, \`skip\` or a Date next time! You just exited the Event creation process!**");
                                return;
                        }
                    }

                    //Define the embed message for end date question
                    embedAuthor = `Event creation process`;
                    embedTitle = 'Please enter a end date';
                    embedMsg = `\n~\n\`# enter 'skip' to forward\`\n\`# enter 'exit' to quit\`\n`;
                    embedFooter = `(Format: <YYYY/MM/DD h:mm>) - default is today`;
                    // message prompt for end date time
                    msg.channel.createMessage({
                        embed: {
                            author: {
                                name: embedAuthor,
                                icon_url: bot.user.avatarURL
                            },
                            color: 0xff8c00,
                            title: embedTitle,
                            description: embedMsg,
                            footer: {
                                text: embedFooter
                            }
                        }
                    }).then(bot_message => {
                        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                            end = moment(usr_message.content.trim(), formats, true); // parse start time
                            let usrResponse = usr_message.content.trim().toLowerCase();

                            if (hasDeletePerm) {
                                bot_message.delete();
                            }

                            if (!end.isValid()) {
                                switch (usrResponse) {

                                    case "exit":
                                        msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                                        return;

                                    case "skip":
                                        end = start; //moment(new Date(),formats,true);
                                        msg.channel.createMessage(`⏩ **Default end date ${end} added!**`);
                                        break;

                                    default:
                                        msg.channel.createMessage("⚠ **Please enter \`exit\`, \`skip\` or a Date next time! You just exited the Event creation process!**");
                                        return;
                                }
                            }

                            //Define the embed message for description question
                            embedAuthor = `Event creation process`;
                            embedTitle = 'Please enter a short description for the event';
                            embedMsg = `\n~\n\`# enter 'skip' to forward\`\n\`# enter 'exit' to quit\`\n`;
                            embedFooter = `(maximum of 100 chars)`;
                            // message prompt for description
                            msg.channel.createMessage({
                                embed: {
                                    author: {
                                        name: embedAuthor,
                                        icon_url: bot.user.avatarURL
                                    },
                                    color: 0xff8c00,
                                    title: embedTitle,
                                    description: embedMsg,
                                    footer: {
                                        text: embedFooter
                                    }
                                }
                            }).then(bot_message => {
                                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                                    description = usr_message.content.trim();
                                    if (hasDeletePerm) {
                                        bot_message.delete();
                                    }

                                    if (description.length > 2000 || description === "exit") {
                                        msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                                        return;
                                    } else {
                                        if (description === "skip") {
                                            msg.channel.createMessage("⏩ **No description added.**");
                                            description = "";
                                        }
                                    }

                                    //Define the embed message for tag question
                                    embedAuthor = `Event creation process`;
                                    embedTitle = 'Please enter one or multiple tag(s) for the event';
                                    embedMsg = `\n~\n\`# enter 'skip' to forward\`\n\`# enter 'exit' to quit\`\n`;
                                    embedFooter = `(IMPORTANT: only use comma as separator (e.g. <tag1>,<tag2>,<tag3>))`;
                                    // message prompt for description
                                    msg.channel.createMessage({
                                        embed: {
                                            author: {
                                                name: embedAuthor,
                                                icon_url: bot.user.avatarURL
                                            },
                                            color: 0xff8c00,
                                            title: embedTitle,
                                            description: embedMsg,
                                            footer: {
                                                text: embedFooter
                                            }
                                        }
                                    }).then(bot_message => {
                                        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                                            tags.push(usr_message.content.trim().split(","));
                                            //testing tags

                                            if (hasDeletePerm) {
                                                bot_message.delete();
                                            }

                                            if (description.length > 2000 || description === "exit") {
                                                msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                                                return;
                                            } else {
                                                if (description === "skip") {
                                                    msg.channel.createMessage("⏩ **No tags added.**");
                                                }
                                            }

                                            //Define the embed message for platform question
                                            embedAuthor = `Event creation process`;
                                            embedTitle = 'Please enter the maximum number of attendees for the event';
                                            embedMsg = `\n~\n\`# enter 'skip' to forward\`\n\`# enter 'exit' to quit\`\n`;
                                            embedFooter = `(Enter a number as integer - default: 3)`;
                                            // message prompt for description
                                            msg.channel.createMessage({
                                                embed: {
                                                    author: {
                                                        name: embedAuthor,
                                                        icon_url: bot.user.avatarURL
                                                    },
                                                    color: 0xff8c00,
                                                    title: embedTitle,
                                                    description: embedMsg,
                                                    footer: {
                                                        text: embedFooter
                                                    }
                                                }
                                            }).then(bot_message => {
                                                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                                                    maxAttendees = parseInt(usr_message.content.trim());
                                                    let strMaxAttendees = usr_message.content.trim();
                                                    if (hasDeletePerm) {
                                                        bot_message.delete();
                                                    }
                                                    if (isNaN(maxAttendees)) {
                                                        
                                                        if (strMaxAttendees.length > 2000 || strMaxAttendees === "exit") {
                                                            msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                                                            return;
                                                        } else {
                                                            if (strMaxAttendees === "skip") {
                                                                maxAttendees = 3;
                                                                msg.channel.createMessage("⏩ **Default maximum of 3 members set.**");
                                                            }
                                                        }
                                                    }
                                                    //get max id from server document and count up

                                                    let newEventID = 0;
                                                    let maxEventID = 0;

                                                    if (typeof serverDocument.gameEvents[0] === 'undefined' || serverDocument.gameEvents.length === 0 || serverDocument.gameEvents[0] === null) {
                                                        maxEventID = 0;
                                                    } else {
                                                        maxEventID = Math.max.apply(Math, serverDocument.gameEvents.map(a => a._id));
                                                    }

                                                    if (!isNaN(maxEventID)) {
                                                        newEventID = maxEventID + 1;
                                                    } else {
                                                        winston.error("Max Event ID could not be evaluated (see CreateInterActive.js) - line 119");
                                                    }

                                                    //let newEventID = serverDocument.gameEvents.length+1;


                                                    //get author of event
                                                    let eventAuthor = msg.author.id;

                                                    let embed_fields = [];
                                                    
                                                   /* if (skipStart) {
                                                        
                                                        serverDocument.gameEvents.push({
                                                            _id: newEventID,
                                                            title: title,
                                                            description: description,
                                                            _author: eventAuthor,
                                                            maxAttendees: maxAttendees
                                                        });
                                                    } else {
                                                        
                                                        serverDocument.gameEvents.push({
                                                            _id: newEventID,
                                                            title: title,
                                                            start: start,
                                                            end: end,
                                                            description: description,
                                                            _author: eventAuthor,
                                                            maxAttendees: maxAttendees
                                                        });
                                                    }*/

                                                        serverDocument.gameEvents.push({
                                                            _id: newEventID,
                                                            title: title,
                                                            start: start,
                                                            end: end,
                                                            description: description,
                                                            _author: eventAuthor,
                                                            maxAttendees: maxAttendees
                                                        });

                                                    embed_fields = [{
                                                            name: "**Title**",
                                                            value: `${title}`,
                                                            inline: false
                                                        },
                                                        {
                                                            name: "**Description**",
                                                            value: `${description}`,
                                                            inline: false
                                                        },
                                                        {
                                                            name: "**Start**",
                                                            value: `${start}`,
                                                            inline: false
                                                        },
                                                        {
                                                            name: "**End**",
                                                            value: `${end}`,
                                                            inline: false

                                                        },
                                                        {
                                                            name: "**Max Attendees**",
                                                            value: `${maxAttendees}`,
                                                            inline: false

                                                        },
                                                        {
                                                            name: "**Tags**",
                                                            value: `${tags}`,
                                                            inline: false

                                                        }
                                                    ];

                                                    // create event, save serverDocument

                                                    serverDocument.save(err => { // 'save' the server and handle error
                                                        if (err) {
                                                            winston.error("Failed to save server data for event creation", {
                                                                svrid: msg.guild.id
                                                            }, err);
                                                            msg.channel.createMessage("Something went wrong! I failed to save your event. It's my dev's fault!");
                                                        } else {
                                                            msg.channel.createMessage({
                                                                embed: {
                                                                    author: {
                                                                        name: `~~ Event with **🆔[${newEventID}]** successfully created ~~`,
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
                });
            });
        });
    });
};
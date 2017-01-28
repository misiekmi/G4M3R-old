const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    let title = "",
        start, end, description;
    let skipStart = false,
        skipEnd = false,
        skipDesc = false;

    // for format options, reference: http://momentjs.com/docs/#/parsing/string-format/
    const formats = ["YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];

    // message prompt for title
    var embedMsg = "", embedFooter = "", embedTitle = "", embedAuthor = "";

    //Define the embed message for Title Question
    embedAuthor = "EVENT CREATION PROCESS";
    embedTitle = "~ What is the title of your event? ~";
    embedMsg = `\n\n# enter any title as string *(max. 2000 chars)*\n`;
    embedFooter =  `# enter \`exit\` to quit the event cration process.`;

    msg.channel.createMessage({embed: {author: { name: embedAuthor},color: 0xffffff, title: embedTitle, description: embedMsg, footer: {text: embedFooter}}}).then(bot_message => {
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

            // message prompt for start date time
            msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter the start date of the event!\n\n# **Format**: <\YYYY/MM/DD h:mm>\n
            # Enter \`exit\` to exit the process.\`\`\``).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                    start = moment(usr_message.content.trim(), formats, true); // parse start time
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
                                msg.channel.createMessage("⏩ **No Start Date given!**");
                                skipStart = true;
                                break;

                            default:
                                msg.channel.createMessage("⚠ **Please enter \`exit\`, \`skip\` or a Date next time! You just exited the Event creation process!**");
                                return;
                        }
                    }

                    // message prompt for end date time

                    msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter the end date of the event!\n\n# **Format**: 
                        <YYYY/MM/DD h:mm>\n# Enter \`exit\` to exit the process.\n# Enter \`skip\` to continue without a description.\`\`\``).then(bot_message => {
                        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                            end = moment(usr_message.content.trim(), formats, true); // parse start time
                            let usrResponse = usr_message.content.trim().toLowerCase();

                            if (hasDeletePerm) {
                                bot_message.delete();
                            }

                            if (!start.isValid()) {
                                switch (usrResponse) {

                                    case "exit":
                                        msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                                        return;

                                    case "skip":
                                        msg.channel.createMessage("⏩ **No End Date given!**");
                                        skipEnd = true;
                                        break;

                                    default:
                                        msg.channel.createMessage("⚠ **Please enter \`exit\`, \`skip\` or a Date next time! You just exited the Event creation process!**");
                                        return;
                                }
                            }


                            // message prompt for end date time
                            msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter a short description, if you want to.\n\n# Enter any title as string\n
                                    # Enter \`exit\` to exit the process.\n# Enter \`skip\` to continue without a description.\`\`\``).then(bot_message => {
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
                                            msg.channel.createMessage("⏩ **No description given!**");
                                            skipDesc = true;
                                        }
                                    }

                                    //get max id from server document and count up

                                        var newEventID = 0;
                                        var maxEventID= 0;

                                        if(serverDocument.gameEvents[0] === null) {
                                             maxEventID = 0;
                                        } else {    
                                            maxEventID = Math.max.apply(Math, serverDocument.gameEvents.map(a=>a._id));
                                        }

                                        if (!isNaN(maxEventID)) {
                                            newEventID = maxEventID +1;
                                        } else {
                                            winston.error("Max Event ID could not be evaluated (see CreateInterActive.js) - line 119")
                                        }
                                         

                                    //get author of event

                                    let eventAuthor = msg.author.id;

                                    let embed_fields = [];
                                    

                                    if (skipStart || skipEnd) {

                                        serverDocument.gameEvents.push({
                                            _id: newEventID,
                                            title: title,
                                            description: description,
                                            _author: eventAuthor
                                        }); // create event, push it to gameEvents

                                        embed_fields = [{
                                                name: "**Title**",
                                                value: `${title}`,
                                                inline: true
                                            },
                                            {
                                                name: "**Description**",
                                                value: `${description}`,
                                                inline: true
                                            }
                                        ];
                                    } else {

                                        serverDocument.gameEvents.push({
                                            _id: newEventID,
                                            title: title,
                                            start: start,
                                            end: end,
                                            description: description,
                                            _author: eventAuthor
                                        });

                                        embed_fields = [{
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

                                            }
                                        ];
                                    } 
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
};
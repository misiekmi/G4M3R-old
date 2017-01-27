const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    let title = '', start, end, description;
    let skipStart = false,
        skipEnd = false,
        skipDesc = false;

    // for format options, reference: http://momentjs.com/docs/#/parsing/string-format/
    const formats = ["YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];

    // message prompt for title

    var queryUserEvent = function () {
        
        var getTitle = function() {
            msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nWhat is the title the event?\n\n# Enter any title as string\n# 
            Enter \`exit\` to exit the process.\`\`\``).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    
                    title = usr_message.content.trim();

                    if (title.length > 2000 || title === "exit") {
                        msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                        return;
                    }

                    if (hasDeletePerm) {
                        bot_message.delete();
                    }
                });
            });
        },

        getStartDate = function () {
            msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter the start date of the event!\n\n# **Format**: <\YYYY/MM/DD h:mm>\n# 
            Enter \`exit\` to exit the process.\`\`\``).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    
                start = moment(usr_message.content.trim(), formats, true); // parse start time
                let usrResponse = usr_message.content.trim().toLowerCase();

                    
                    if (!start.isValid()) {
                        switch(usrResponse) {

                            case "exit": 
                                msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                                return;
                            case "skip": msg.channel.createMessage("⏩ **No Start Date given!**");
                                skipStart = true;
                                break;

                            default:
                                msg.channel.createMessage("⚠ **Please enter a valid String  or Date next time! You just exited the Event creation process!**");
                                return;
                        }
                    }

                    if (hasDeletePerm) {
                        bot_message.delete();
                    }
                });
            });
        },

        getEndDate = function () {
            msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter the end date of the event!\n\n# **Format**: 
            <\YYYY/MM/DD h:mm>\n# Enter \`exit\` to exit the process.\n# Enter \`skip\` to continue without a description.\`\`\``).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    
                end = moment(usr_message.content.trim(), formats, true); // parse start time
                let usrResponse = usr_message.content.trim().toLowerCase();

                    if (hasDeletePerm) {
                        bot_message.delete();
                    }
                    
                    if (!start.isValid()) {
                        switch(usrResponse) {

                            case "exit":
                                msg.channel.createMessage("ℹ **You just exited the Event creation process!**");
                                return;
                            
                            case "skip":
                                msg.channel.createMessage("⏩ **No End Date given!**");
                                skipEnd = true;
                                break;

                            default:
                                msg.channel.createMessage("⚠ **Please enter a valid String or Date next time! You just exited the Event creation process!**");
                                return;
                        }
                    }

                });
            });
        },

        getDescription = function() {
            msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter a short description, if you want to.\n\n# Enter any title as string\n# 
            Enter \`exit\` to exit the process.\n# Enter \`skip\` to continue without a description.\`\`\``).then(bot_message => {
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
                });
            });
        };
    };

    getTitle()
        .then( getStartDate(),winston.error('Error while trying to get Start Date for Event creation'))
        .then( getEndDate(),winston.error('Error while trying to get End Date for Event creation'))
        .then( getDescription(),winston.error('Error while trying to get Description for Event creation'));


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
                value: `${skipDesc ? '' : description}`,
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
                value: `${skipDesc ? '' : description}`,
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
            winston.error("Failed to save server data for event creation", {
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
    
};

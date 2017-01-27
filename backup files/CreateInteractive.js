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
    msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nWhat is the title the event?\n\n# Enter any title as string\n
                                # Enter \`exit\` to exit the process.\`\`\``).then(bot_message => {
        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

            title = usr_message.content.trim();
            if (hasDeletePerm)
                bot_message.delete().then(() => usr_message.delete());

            // message prompt for start date time
            msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter the start date of the event!\n\n# **Format**: <\YYYY/MM/DD h:mm>\n
                                    # Enter \`exit\` to exit the process.\`\`\``).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

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
                        msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter the end date of the event!\n\n# **Format**: 
                                                    <YYYY/MM/DD h:mm>\n# Enter \`exit\` to exit the process.\n# Enter \`skip\` to continue without a description.\`\`\``).then(bot_message => {
                            bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

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
                                    msg.channel.createMessage(`\`\`\`\n **## EVENT CREATION ##**\n\nPlease enter a short description, if you want to.\n\n# Enter any title as string\n# 
                                                                 Enter \`exit\` to exit the process.\n# Enter \`skip\` to continue without a description.\`\`\``).then(bot_message => {
                                        bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {

                                            description = usr_message.content.trim();
                                            bot_message.delete().then(() => usr_message.delete());

    /* PROMISE FAIL by pedall
    
    // message prompt for title
        
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
    };

   var getStartDate = function () {
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
    };

    var getEndDate = function () {
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
    };

    var getDescription = function() {
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

            //get max id from server document and count up

        let newEventID;

        if (serverDocument.gameEvents.find().sort({_id:-1}).limit(1).pretty() === "None") {
            newEventID = 1;
        } else {
            let  maxEventID = serverDocument.gameEvents.find().sort({_id:-1}).limit(1).pretty();
            newEventID = maxEventID++;
        }

        let embed_fields = [];

        if( skipStart || skipEnd ) {

            serverDocument.gameEvents.push({
                _id: newEventID,
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
                _id: newEventID,
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

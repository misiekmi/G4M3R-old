const async = require("async");
const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg, viewer, embed) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    const page_size = viewer.page_size;
    const formats = ["YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];

    let current_page_no = 1;

    let cancel = false;
    let error = false;

    async.whilst(() => {
            return !cancel;
        },
        (callback) => {
            msg.channel.createMessage(embed).then(bot_message => {
                let timeout = setTimeout(()=>{bot_message.delete();}, 20000); //delete message in 1 minute

                winston.info(`waiting for user message`);
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    winston.info(`read user message ${usr_message.content}`);
                    bot.removeMessageListener(msg.channel.id, msg.author.id)
                    clearTimeout(timeout);  //clear the active timeout

                    let usr_input = usr_message.content.trim();

                    // exit interactive
                    if(usr_input.toLowerCase() == "exit") {
                        cancel = true;
                    }
                    else if(error) {
                        // return to eventDocument list page
                        if(usr_input == "back") {
                            error = false;
                            embed = viewer.getPageView(current_page_no);
                        }
                    }
                    else if(viewer.mode==1) {      // list view mode
                        // get eventDocument
                        if (!isNaN(usr_input) && usr_input > 0) {
                            viewer.event = viewer.getEvent(usr_input);
                            if(!viewer.event) {
                                let body = `Event #${usr_input} does not exists!\n\n` +
                                    `## \`\`[back]\`\` to return to event list\n` +
                                    `## \`\`[exit]\`\` to quit view`;
                                embed = {embed: {description: body, footer: {text: `error!`}}};
                                error = true;
                            } else {
                                embed = viewer.getEventView();
                            }
                        }
                        // go to next page
                        else if (usr_input == `+` && page_size*current_page_no<serverDocument.gameEvents.length) {
                            current_page_no++;
                            embed = viewer.getPageView(current_page_no);
                        }
                        // go to previous page
                        else if (usr_input == `-` && current_page_no>1) {
                            current_page_no--;
                            embed = viewer.getPageView(current_page_no);
                        }
                    }
                    else if(viewer.mode==2) {       // event view mode
                        // return to eventDocument list page
                        if(usr_input == "back") {
                            embed = viewer.getPageView(current_page_no);
                        }
                        else if(usr_input == "edit") {
                            embed = viewer.getEventEditView();
                        }
                        else if(usr_input == "delete") {
                            embed = viewer.deleteEvent(viewer.event);
                        }
                    }
                    else if(viewer.mode==3) {       // editor mode
                        if(viewer.edit_mode==0) {
                            if(usr_input == "back") {
                                serverDocument.save((err)=>{
                                    if(err) {
                                        winston.error(`Failed to save event changes`, {srvid: serverDocument._id}, err);
                                    }
                                });
                                embed = viewer.getEventView();
                            }
                            else {
                                if(!isNaN(usr_input)){
                                    viewer.edit_mode = Number(usr_input);
                                    embed = viewer.getEditorView();
                                }
                            }
                        } else {
                            if(usr_input == "back"){
                                embed = viewer.getEventEditView();
                                viewer.edit_mode = 0;
                            } else {
                                let time, body;
                                switch(viewer.edit_mode) {
                                    case 1:
                                        viewer.event.title = usr_input;
                                        break;
                                    case 2:
                                        time = moment(usr_message.content.trim(), formats, true); // parse start time
                                        if(time.isValid()){
                                            viewer.event.start = time;
                                        } else {
                                            body = `Your input ${usr_input} is not a valid start time!\n\n` +
                                                `## \`\`[back]\`\` to return to event list\n` +
                                                `## \`\`[exit]\`\` to quit view`;
                                            embed = {embed: {description: body, footer: `error!`}};
                                            error = true;
                                        }
                                        break;
                                    case 3:
                                        time = moment(usr_message.content.trim(), formats, true); // parse start time
                                        if(time.isValid()){
                                            viewer.event.end = time;
                                        } else {
                                            body = `Your input ${usr_input} is not a valid end time!\n\n` +
                                                `## \`\`[back]\`\` to return to event list\n` +
                                                `## \`\`[exit]\`\` to quit view`;
                                            embed = {embed: {description: body, footer: `error!`}};
                                            error = true;
                                        }
                                        break;
                                    case 4:
                                        viewer.event.description = usr_input;
                                        break;
                                    case 5:
                                        if(!isNaN(usr_input) && usr_input>=0) {
                                            viewer.event.attendee_max = usr_input;
                                        } else {
                                            body = `Your input ${usr_input} is not a number!\n\n` +
                                                `## \`\`[back]\`\` to return to event list\n` +
                                                `## \`\`[exit]\`\` to quit view`;
                                            embed = {embed: {description: body, footer: `error!`}};
                                            error = true;
                                        }
                                        break;
                                }
                                if(!error) {
                                    embed = viewer.getEventEditView();
                                    viewer.edit_mode = 0;
                                }
                            }
                        }
                    }
                    else if(viewer.mode==4) {       // delete queued mode
                        if(usr_input == "back") {
                            embed = viewer.getPageView(current_page_no);
                        }
                    }

                    bot_message.delete();
                    if(hasDeletePerm){
                        usr_message.delete();
                    }

                    callback();
                });
            });
        });
};

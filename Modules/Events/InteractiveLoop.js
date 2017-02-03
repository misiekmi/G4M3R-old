const async = require("async");
const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg, viewer, embed) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    const page_size = viewer.page_size;

    let current_page_no = 1;
    let current_event;

    let cancel = false;
    let error = false;
    let delete_view = false;
    let event_view = false;

    async.whilst(() => {
            return !cancel;
        },
        (callback) => {
            msg.channel.createMessage(embed).then(bot_message => {
                let timeout = setTimeout(()=>{bot_message.delete();}, 60000); //delete message in 1 minute

                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    bot.removeMessageListener(msg.channel.id, msg.author.id);
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
                    else if(delete_view) {
                        if(usr_input == "back") {
                            delete_view = false;
                            embed = viewer.getPageView(current_page_no);
                        }
                    }
                    else if(viewer.mode==2) {       // if in eventDocument view mode
                        // return to eventDocument list page
                        if(usr_input == "back") {
                            event_view = false;
                            embed = viewer.getPageView(current_page_no);
                        }
                        else if(usr_input == "delete"){
                            delete_view = true;
                            embed = viewer.deleteEvent(current_event);
                            current_event = null;
                        }
                    }
                    else if(viewer.mode==1) {      // otherwise in list view mode
                        // get eventDocument
                        if (!isNaN(usr_input) && usr_input > 0) {
                            current_event = viewer.getEvent(usr_input);
                            if(!current_event) {
                                let body = `Event #${usr_input} does not exists!\n\n` +
                                    `## \`\`[back]\`\` to return to event list\n` +
                                    `## \`\`[exit]\`\` to quit view`;
                                embed = {embed: {description: body, footer: `error!`}};
                                error = true;
                            } else {
                                embed = viewer.getEventView(current_event);
                                event_view = true;
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

                    bot_message.delete();
                    if(hasDeletePerm){
                        usr_message.delete();
                    }

                    callback();
                });
            });
        });
};

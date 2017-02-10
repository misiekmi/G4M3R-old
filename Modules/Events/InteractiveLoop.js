const async = require("async");
const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg, viewer, embed) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    const page_size = viewer.page_size;
    const formats = ["YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];

    let current_page_no = 1;

    let cancel = false;
    async.whilst(() => {
            return !cancel;
        },
        (callback) => {
            msg.channel.createMessage(embed).then(bot_message => {
                let timeout = setTimeout(()=>{bot_message.delete();}, 30000); //delete message in 1/2 minute
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    bot.removeMessageListener(msg.channel.id, msg.author.id);
                    clearTimeout(timeout);  //clear the active timeout

                    let usr_input_no = usr_message.content.trim();
                    let usr_input_str = usr_message.content.trim().toLowerCase();

                    // quit interactive
                    if(usr_input_str === "quit" || usr_input_str === "q") {
                        cancel = true;
                    } else if(viewer.mode === 1) {      // list view mode
                        // get eventDocument
                        if (!isNaN(usr_input_no) && usr_input_no > 0) {
                            if(viewer.setEvent(usr_input_no)) {
                                embed = viewer.getEventView();
                            } else {
                                embed = viewer.getErrorView(2,usr_input_no);
                            }
                        }
                        // go to next page
                        else if (usr_input_str === `+` && page_size*current_page_no<viewer.events.length) {
                            current_page_no++;
                            embed = viewer.getPageView(current_page_no);
                        }
                        // go to previous page
                        else if (usr_input_str == `-` && current_page_no>1) {
                            current_page_no--;
                            embed = viewer.getPageView(current_page_no);
                        }
                    } else if(viewer.mode === 2) {       // event view mode
                        // return to eventDocument list page
                        if(usr_input_str == "back" || usr_input_str == "b") {
                            embed = viewer.getPageView(current_page_no);
                        } else if(usr_input_str == "edit" || usr_input_str == "e") {
                            embed = viewer.getEventEditView();
                        } else if(usr_input_str == "delete" || usr_input_str == "d") {
                            embed = viewer.deleteEvent(viewer.event);
                        } else if(usr_input_str == "join" || usr_input_str == "j") {
                            embed = viewer.joinEvent(viewer.event, msg.author.id);
                        } else if(usr_input_str == "leave" || usr_input_str == "l") {
                            embed = viewer.leaveEvent(viewer.event, msg.author.id);
                        }
                    } else if(viewer.mode === 3) {       // editor mode
                        if(viewer.edit_mode === 0) {
                            if(usr_input_str == "back" || usr_input_str == "b") {
                                viewer.event.save((err)=>{
                                    if(err) {
                                        winston.error(`Failed to save event changes`, {_id: viewer.event._id}, err);
                                    }
                                });
                                embed = viewer.getEventView();
                                viewer.edits_made = {};
                            } else {
                                if(!isNaN(usr_input_no) && usr_input_no>0 && usr_input_no<=6){
                                    viewer.edit_mode = Number(usr_input_no);
                                    embed = viewer.getEditorView();
                                }
                            }
                        } else {
                            if(usr_input_str === "back" || usr_input_str === "b"){
                                embed = viewer.getEventEditView();
                                viewer.edit_mode = 0;
                            } else {
                                let time, error;
                                switch(viewer.edit_mode) {
                                    case 1:
                                        viewer.event.title = usr_input_str;
                                        viewer.edits_made.title = usr_input_str;
                                        break;
                                    case 2:
                                        time = moment(usr_message.content.trim(), formats, true); // parse start time
                                        if(time.isValid()){
                                            viewer.event.start = time;
                                            viewer.edits_made.start = time;
                                        } else {
                                            embed = viewer.getErrorView(3,usr_input_no);
                                            error = true;
                                        }
                                        break;
                                    case 3:
                                        time = moment(usr_message.content.trim(), formats, true); // parse start time
                                        if(time.isValid()){
                                            viewer.event.end = time;
                                            viewer.edits_made.end = time;
                                        } else {
                                            embed = viewer.getErrorView(4,usr_input_no);
                                            error = true;
                                        }
                                        break;
                                    case 4:
                                        viewer.event.description = usr_input_str;
                                        viewer.edits_made.description = usr_input_str;
                                        break;
                                    case 5:
                                        if(usr_input_no>=0) {
                                            viewer.event.attendee_max = usr_input_no;
                                            viewer.edits_made.attendee_max = usr_input_no;
                                        } else {
                                            embed = viewer.getErrorView(5,usr_input_no);
                                            error = true;
                                        }
                                        break;
                                    case 6:
                                        let tags = usr_input_no.split(",");
                                        viewer.event.tags = tags;
                                        viewer.edits_made.tags = tags;
                                }

                                if(!error) {
                                    embed = viewer.getEventEditView();
                                    viewer.edit_mode = 0;
                                }
                            }
                        }
                    } else if(viewer.mode === 4) {       // back to list or quit
                        if(usr_input_str === "back" || usr_input_str === "b") {
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

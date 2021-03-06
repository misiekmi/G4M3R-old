const async = require("async");
const moment = require("moment-timezone");
const auth = require("./EventsAuth");

module.exports = (bot, db, winston, serverDocument, msg, viewer, embed) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    const page_size = viewer.page_size;
    const formats = ["h:mma", "MM-DD h:mma", "YYYY-MM-DD h:mma"];

    let current_page_no = 1;

    let cancel = false;
    async.whilst(() => {
            return !cancel;
        },
        (callback) => {
            msg.channel.createMessage(embed).then(bot_message => {
                let timeout = setTimeout(() => { bot_message.delete(); }, 60000); //delete message in 1/2 minute
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    bot.removeMessageListener(msg.channel.id, msg.author.id);
                    clearTimeout(timeout); //clear the active timeout

                    let usr_input_no = usr_message.content.trim();
                    let usr_input_str = usr_message.content.trim().toLowerCase();

                    // quit interactive
                    if (usr_input_str === "quit" || usr_input_str === "q") {
                        cancel = true;
                        // remove the event if quiting out of the creation process
                        if (viewer.add_not_edit) {
                            viewer.db.events.remove({_id: viewer.event._id}, (err) => {
                                if (err) {
                                    console.log(err.stack);
                                }
                            });
                            for (let i = 0; i < viewer.events.length; i++) {
                                if (viewer.events[i]._id === viewer.event._id) {
                                    viewer.events.splice(i, 1);
                                }
                            }
                        }
                    } else if (viewer.mode === 1) { // list view mode
                        // get eventDocument
                        if (!isNaN(usr_input_no) && usr_input_no > 0) {
                            if (viewer.setEvent(usr_input_no)) {
                                embed = viewer.getEventView();
                            } else {
                                embed = viewer.getErrorView(2, usr_input_no);
                            }
                        }
                        // go to next page
                        else if (usr_input_str === `+` && page_size * current_page_no < viewer.events.length) {
                            current_page_no++;
                            embed = viewer.getPageView(current_page_no);
                        }
                        // go to previous page
                        else if (usr_input_str == `-` && current_page_no > 1) {
                            current_page_no--;
                            embed = viewer.getPageView(current_page_no);
                        }
                    } else if (viewer.mode === 2) { // event view mode
                        // return to eventDocument list page
                        if (usr_input_str == "back" || usr_input_str == "b") {
                            embed = viewer.getPageView(current_page_no);
                        } else if ((usr_input_str == "edit" || usr_input_str == "e") &&
                            (auth.toDeleteOrEdit(viewer.server, viewer.event, viewer.member))) {
                            embed = viewer.getEventEditView();
                        } else if ((usr_input_str == "delete" || usr_input_str == "d") &&
                            (auth.toDeleteOrEdit(viewer.server, viewer.event, viewer.member))) {
                            embed = viewer.deleteEvent(viewer.event);
                        } else if ((usr_input_str == "kick" || usr_input_str == "k") &&
                            (auth.toDeleteOrEdit(viewer.server, viewer.event, viewer.member))) {
                            embed = viewer.getKickView(viewer.event);
                        } else if (usr_input_str == "join" || usr_input_str == "j") {
                            msg.channel.createMessage(viewer.joinEvent(viewer.event, msg));
                            cancel = true;
                        } else if (usr_input_str == "leave" || usr_input_str == "l") {
                            msg.channel.createMessage(viewer.leaveEvent(viewer.event, msg));
                            cancel = true;
                        } else if ((usr_input_str == "attendees" || usr_input_str == "a") &&
                            (typeof viewer.event.attendees !== "undefined" && viewer.event.attendees.length > 0)){  //TODO: set 0 to 14 after testing
                            embed = viewer.getEventAttendeesView(viewer.event);
                        }
                    } else if (viewer.mode === 3) { // editor mode
                        if (viewer.edit_mode === 0) {
                            if (usr_input_str == "save" || usr_input_str == "s") { //save event after edit or add

                                //edits are only saved to the event if users saves it, when canceling old values stay the same
                                if(viewer.edits_made.title) {
                                    viewer.event.title = viewer.edits_made.title;
                                }
                                if(viewer.edits_made.start) {
                                    viewer.event.start = viewer.edits_made.start;
                                }
                                if(viewer.edits_made.end) {
                                    viewer.event.end = viewer.edits_made.end;
                                }
                                if(viewer.edits_made.description) {
                                    viewer.event.description = viewer.edits_made.description;
                                }
                                if(viewer.edits_made.attendee_max) {
                                    viewer.event.attendee_max = viewer.edits_made.attendee_max;
                                }
                                if(viewer.edits_made.tags) {
                                    viewer.event.tags = viewer.edits_made.tags;
                                }
                                viewer.event.save((err) => {
                                    if (err) {
                                        winston.error(`Failed to save event changes in edit mode`, { _id: viewer.event._id }, err);
                                    }
                                });

                                viewer.edits_made = {};
                                viewer.add_not_edit = false;

                                embed = viewer.getEventView();
                            } else if((usr_input_str == "cancel" || usr_input_str == "c") && !viewer.add_not_edit) {
                                viewer.edits_made = {};
                                viewer.add_not_edit = false;
                                embed = viewer.getEventView();
                            } else {
                                if (!isNaN(usr_input_no) && usr_input_no > 0 && usr_input_no <= 6) {
                                    viewer.edit_mode = Number(usr_input_no);
                                    embed = viewer.getEditorView();
                                }
                            }
                        } else {
                            if (usr_input_str === "cancel" || usr_input_str === "c") {
                                embed = viewer.getEventEditView();
                            } else {
                                let time, error;
                                switch (viewer.edit_mode) {
                                    case 1: // title
                                        if(usr_input_no.length <= 100) {            // length of title limit
                                            viewer.edits_made.title = usr_input_no;
                                        } else {
                                            embed = viewer.getErrorView(6, usr_input_no);
                                            error = true;
                                        }
                                        break;
                                    case 2: // start time
                                        time = moment.tz(usr_message.content.trim(), formats, false, viewer.timezone); // parse start time
                                        if (time.isValid()) {
                                            viewer.edits_made.start = time;
                                        } else {
                                            embed = viewer.getErrorView(3, usr_input_no);
                                            error = true;
                                        }
                                        break;
                                    case 3: // end time
                                        time = moment.tz(usr_message.content.trim(), formats, false, viewer.timezone); // parse start time
                                        if (time.isValid()) {
                                            viewer.edits_made.end = time;
                                        } else {
                                            embed = viewer.getErrorView(4, usr_input_no);
                                            error = true;
                                        }
                                        break;
                                    case 4: // description
                                        if(usr_input_no.length <= 300) {                    // length of desc limit
                                            viewer.edits_made.description = usr_input_no;
                                        } else {
                                            embed = viewer.getErrorView(6, usr_input_no);
                                            error = true;
                                        }
                                        break;
                                    case 5: // number of player slots
                                        if (usr_input_no >= 0 && usr_input_no <= 999999) {  //added upper limit 999999
                                            viewer.edits_made.attendee_max = usr_input_no;
                                        } else {
                                            embed = viewer.getErrorView(5, usr_input_no);
                                            error = true;
                                        }
                                        break;
                                    case 6: // tags
                                        let tags = usr_input_no.split(",");

                                        let within_limits = tags.length <= 10;  // number of tag limit
                                        for(let i=0; i<tags.length; i++) {
                                            if(tags[i].length>=15) {            // length of each tag limit
                                                within_limits = false;
                                            }
                                        }

                                        if(within_limits) {
                                            viewer.edits_made.tags = tags;
                                        } else {
                                            embed = viewer.getErrorView(6, usr_input_no);
                                            error = true;
                                        }
                                        break;
                                }

                                if (!error) {
                                    embed = viewer.getEventEditView();
                                }
                            }
                        }
                    } else if (viewer.mode === 4) { // back to list or quit
                        if (usr_input_str === "back" || usr_input_str === "b") {
                            embed = viewer.getPageView(current_page_no);
                        }
                    } else if (viewer.mode === 5) { // error mode
                        if(viewer.previous_mode === 3) {
                            embed = viewer.getEventEditView();
                        } else {
                            embed = viewer.getPageView(current_page_no);
                        }
                    } else if (viewer.mode === 6) { // error mode
                        if(viewer.previous_mode === 2) {
                            embed = viewer.getEventView();
                        } else {
                            cancel = true;
                        }
                    } else if (viewer.mode === 7) { // kick user mode
                        console.log(viewer.event.attendees);
                        if(usr_input_str==="cancel"||usr_input_str==="c") {
                            embed = viewer.getEventView();
                        } else {
                            embed = viewer.kickUser(usr_input_no.replace("<@","").replace(">",""));
                        }
                    } else if (viewer.mode === 8) { // return from kick to event view
                        if (usr_input_str === "back" || usr_input_str === "b") {
                            embed = viewer.getEventView();
                        }
                    }
                    bot_message.delete();
                    if (hasDeletePerm) {
                        usr_message.delete();
                    }

                    callback();
                });
            });
        });
};
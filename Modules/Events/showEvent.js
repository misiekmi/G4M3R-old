const async = require("async");
const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg, suffix) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    
    // for format options, reference: http://momentjs.com/docs/#/parsing/string-format/
    const formats = ["YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];
    // settings
	let hasArgs = false;
	let isAdmin = false;
	var firstArg = 0;
	let secondArg;
    let embed = "";

	this.parse = () => {
		const params = suffix.split(" ");

		if(params.length >= 1) {
            firstArg = parseInt(params[0]);
		}

		if(params.length >= 2) {
			secondArg = params[1].trim();
		}
        
		const admin_user = serverDocument.config.admins.id(msg.author.id);
		isAdmin = admin_user && admin_user.level;
		hasArgs = params.length > 1;

		return true;
	};

  if (this.parse()) {
    this.get = _eventID => {
        _eventID = firstArg;
        return serverDocument.gameEvents._id(_eventID);
    };

    let event = this.get();
    
    msg.channel.createMessage(event);

    // function which is used to generate the page view of a single event entry
    const getEventPage = () => {
        let page_content = "" +
            `\`\`Title\`\`: ${event.title}\n` +
            `\`\`Author\`\`: <@${event._author}>\n` +
            `\`\`Start\`\`: ${event.start}\n` +
            `\`\`End\`\`: ${event.end}\n` +
            `\`\`Description\`\`: ${event.description}\n` +
            //`\`\`Tags\`\`: ${event.tags}\n` +
            //`\`\`Members\`\`: ${event.members.length}\n\n` +
            `\`\`Max Members\`\`: ${event.maxAttendees}\n` +
            `\n##\`\`[edit]\`\` to edit the event\n` +
            `##\`\`[delete]\`\` to delete the event\n` +
            `## \`\`[back]\`\` to return to event list\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
    };
    let embed = getEventPage();
    msg.channel.createMessage(embed);      
  }
};

/*
    const getEditPage = () => {
        let event = pages[current_page_no-1][current_event_no-1];
        let page_content = "" +
            `\`\`[1]\`\` Title: ${event.title}\n` +
            `\`\`[2]\`\` Start: ${event.start}\n` +
            `\`\`[3]\`\` End: ${event.end}\n` +
            `\`\`[4]\`\` Desc: ${event.description}\n` +
            `\`\`[5]\`\` Max Members: ${event.maxAttendees}\n\n` +
            //`\`\`[6]\`\` Tags: ${event.tags}\n` +
            `## \`\`[back]\`\` to return to event page\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
    };

    const getEditTitle = () => {

        let page_content = "" +
            `Current title: \`\`${event.title}\`\`\n` +
            "Enter the new title for the event, or\n\n" +
            `## \`\`[back]\`\` to return to event page\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
    };

    const getEditStart = () => {

        let page_content = "" +
            `Current start: \`\`${event.start}\n\`\`` +
            "Enter the new start time for the event, or\n\n" +
            `## \`\`[back]\`\` to return to event page\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
    };

    const getEditEnd = () => {

        let page_content = "" +
            `Current start: \`\`${event.end}\n\`\`` +
            "Enter the new end time for the event, or\n\n" +
            `## \`\`[back]\`\` to return to event page\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
    };

    const getEditDesc = () => {

        let page_content = "" +
            `Current Description: \n\`\`${event.description}\`\`\n\n` +
            "Enter the new end time for the event, or\n\n" +
            `## \`\`[back]\`\` to return to event page\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
    };

    const getEditMaxMem = () => {

        let page_content = "" +
            `Current maximum member count: \n\`\`${event.maxAttendees}\`\`\n\n` +
            "Enter the new end time for the event, or\n\n" +
            `## \`\`[back]\`\` to return to event page\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
    };

    let embed = getEventPage();
    let cancel = false;

    let event_view = false;
    let event_edit = false;
    let event_edit_attrib = 0;

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
                    else if(event_view) {       // if in eventDocument view mode
                        // delete the eventDocument and return to main page
                        if(usr_input == "delete"){
                            let id = pages[current_page_no-1][current_event_no-1]._id;
                            pages[current_page_no-1][current_event_no-1].remove();
                            pages[current_page_no-1].splice(current_event_no-1, 1);

                            serverDocument.save(err => {
                                if(err) {
                                    winston.error(`Failed to remove event placeholder info`, {srvid: serverDocument._id}, err);
                                } else {
                                    msg.channel.createMessage(`Event #${id} has been successfully removed`).then((msg)=> {
                                        setTimeout(()=>{msg.delete();},10000);
                                    });
                                }
                            });

                            event_view = false;
                            embed = getPage();
                        }
                        // move to edit page
                        else if(usr_input == "edit"){
                            event_edit = true;
                            event_view = false;
                            event_edit_attrib = 0;
                            embed = getEditPage(current_event_no);
                        }
                        // return to eventDocument list page
                        else if(usr_input == "back") {
                            event_view = false;
                            embed = getPage();
                        }
                    }
                    else if( event_edit ) {  // if in eventDocument edit mode
                        if(event_edit_attrib == 0) {
                            if(usr_input == "back") {
                                embed = getEventPage();
                                event_view = true;
                                event_edit = false;
                            }
                            else {
                                switch(usr_input) {
                                    case "1": // title
                                        embed = getEditTitle();
                                        event_edit_attrib = 1;
                                        break;
                                    case "2": // start
                                        embed = getEditStart();
                                        event_edit_attrib = 2;
                                        break;
                                    case "3": // end
                                        embed = getEditEnd();
                                        event_edit_attrib = 3;
                                        break;
                                    case "4": // description
                                        embed = getEditDesc();
                                        event_edit_attrib = 4;
                                        break;
                                    case "5": // maximum members
                                        embed = getEditMaxMem();
                                        event_edit_attrib = 5;
                                        break;
                                    default:
                                        // TODO error message
                                        break;
                                }
                            }
                        } else {
                            if(usr_input == "back"){
                                embed = getEditPage();
                                event_edit_attrib = 0;
                            } else {
                                let eventDocument = pages[current_page_no-1][current_event_no-1];
                                let time;
                                switch(event_edit_attrib) {
                                    case 1:
                                        eventDocument.title = usr_input;
                                        event_edit_attrib = 0;
                                        break;
                                    case 2:
                                        time = moment(usr_message.content.trim(), formats, true); // parse start time
                                        if(time.isValid()){
                                            eventDocument.start = time;
                                            event_edit_attrib = 0;
                                        } else {
                                            // TODO error message
                                        }
                                        break;
                                    case 3:
                                        time = moment(usr_message.content.trim(), formats, true); // parse start time
                                        if(time.isValid()){
                                            eventDocument.end = time;
                                            event_edit_attrib = 0;
                                        } else {
                                            // TODO error message
                                        }
                                        break;
                                    case 4:
                                        eventDocument.description = usr_input;
                                        event_edit_attrib = 0;
                                        break;
                                    case 5:
                                        if(!isNaN(usr_input) && usr_input>=0) {
                                            eventDocument.maxAttendees = usr_input;
                                            event_edit_attrib = 0;
                                        } else {
                                            // TODO error message
                                        }
                                        break;
                                }
                                eventDocument.save(err => {
                                    if(err) {
                                        winston.error(`Failed to save event changes`, {srvid: serverDocument._id}, err);
                                    }
                                });
                            }
                        }
                    }
                    else {      // otherwise in list view mode
                        // get eventDocument
                        if (!isNaN(usr_input) && usr_input <= pages[current_page_no-1].length && usr_input > 0) {
                            current_event_no = usr_input;
                            winston.info(`current event # ${current_event_no}`);
                            embed = getEventPage();
                            event_view = true;
                        }
                        // go to next page
                        else if (usr_input == max_page_size+1 && current_page_no<real_page_size) {
                            current_page_no++;
                            embed = getPage();
                        }
                        // go to previous page
                        else if (usr_input == max_page_size+2 && current_page_no>1) {
                            current_page_no--;
                            embed = getPage();
                        }
                        // error
                        else {
                            msg.channel.createMessage("That's not an option! Please try again.").then((msg)=> {
                                setTimeout(()=>{msg.delete();},10000);
                            });
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
*/


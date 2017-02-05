const moment = require("moment");
const config = require("../../Configuration/config.json");
const msg_color = 0xff8c00;

function Viewer(serverDocument, page_size, filter, msg) {
    this.server = serverDocument;
    this.events = [];
    this.page_size = page_size ? page_size : 3;
    this.mode = 0;
    this.edit_mode = 0;
    this.edits_made = {};

    if(filter) {
        this.filter_disp = "";
        let allEvents = serverDocument.gameEvents;
        for(let i=0; i<allEvents.length; i++) {
            let event = allEvents[i];
            let pass = true;

            if(filter._author && event._author!=filter._author) {
                pass = false;
            }
            else if(filter.tags) {
                for(let i=0; i<filter.tags.length; i++) {
                    let found = false;
                    for(let j=0; j<event.tags.length; j++) {
                        if(filter.tags[i].toLowerCase() == event.tags[j].toLowerCase()) {
                            found = true;
                            break;
                        }
                    }
                    pass = found && pass;
                }
            }

            if(pass) {
                this.events.push(event);
            }
        }
        if(filter._author) {
            this.filter_disp += " | a: <@" + filter._author + ">";
        }
        if(filter.tags) {
            this.filter_disp += " | t: " + filter.tags;
        }
    }
    else {
        this.events = serverDocument.gameEvents;
    }
}

Viewer.prototype.getPageView = function(page_no) {
    try {
        let events_length = this.events.length;
        let page_size = this.page_size;
        this.mode = 1;

        let page_content = "";
        let footer_content = "";
        if((page_no-1)*page_size < events_length) {
            let start_index = (page_no - 1) * page_size;
            let end_index = (start_index + page_size) > events_length ? events_length : start_index + 3;
            //let actualAttendees = this.events.attendees.length;

            for (let i = start_index; i < end_index; i++) {
                page_content += `\`\`[${this.events[i]._id}]\`\` **${this.events[i].title}**\n` +
                    `-by: <@${this.events[i]._author}> - \`(${this.events[i].attendees.length}/${this.events[i].attendee_max})\`\n` +
                    (moment(this.events[i].start).isAfter(moment.now()) ?
                        `-starts ${moment(this.events[i].start).fromNow()}\n` :
                        `-ends ${moment(this.events[i].end).fromNow()}\n`) +
                    "\n";
            }

            if(events_length > end_index) {
                page_content += `## \`\`[+]\`\` next page\n`;
            }
            if(page_no>1){
                page_content += `## \`\`[-]\`\` previous page\n`;
            }
            footer_content = `page ${page_no}/${Math.ceil(events_length/page_size)}`;
        }
        else {
            page_content = "There are no events scheduled on this server.\n\n";  // no entries
            footer_content = "page 1/1";
        }

        page_content += `## \`\`[exit]\`\` to exit the menu\n`;
        if(this.filter_disp){
            footer_content += this.filter_disp;
        } else {
            footer_content += " | unfiltered";
        }

        return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
    }
    catch(err) {
        console.log(err.stack);
    }
};

Viewer.prototype.getEvent = function(event_id) {
    let event;
    for (let i = 0; i < this.events.length; i++) {
        if (this.events[i]._id == event_id) {
            return this.events[i];
        }
    }

    if (!event) {
        return false;
    }
};

Viewer.prototype.getEventView = function() {
    try {
        this.mode = 2;

        let page_content = "" +
            `Title: **${this.event.title}**\n` +
            `Author: <@${this.event._author}>\n\n` +
            `Start: ${moment(this.event.start).format(`${config.moment_date_format}`)}\n` +
            `End: ${moment(this.event.end).format(`${config.moment_date_format}`)}\n\n` +
            `Tags: ${this.event.tags}\n` +
            `Description: \n\`\`\`md\n${this.event.description}\n\`\`\`\n` +
            `Spots Open: \`(${this.event.attendees.length}/${this.event.attendee_max})\`\n` +
            `\n##\`\`[join]\`\` to join the event\n` +
            `\n##\`\`[edit]\`\` to edit the event\n` +
            `##\`\`[delete]\`\` to delete the event\n\n` +
            `## \`\`[back]\`\` to return to event list\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${this.event._id}`;

        return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
    }
    catch(err) {
        console.log(err.stack);
    }
};

Viewer.prototype.getEventEditView = function() {
    try {
        this.mode = 3;

        let page_content = "" +
            `\`\`[1]\`\` Event Title ` +
            (this.edits_made.title?": **"+this.edits_made.title+"**\n":"\n") +
            `\`\`[2]\`\` Start Time ` +
            (this.edits_made.start?": **"+moment(this.edits_made.start).format(`${config.moment_date_format}`)+"**\n":"\n") +
            `\`\`[3]\`\` End Time ` +
            (this.edits_made.end?": **"+moment(this.edits_made.end).format(`${config.moment_date_format}`)+"**\n":"\n") +
            `\`\`[4]\`\` Description ` +
            (this.edits_made.description?"```md\n"+this.edits_made.description+"```\n":"\n")  +
            `\`\`[5]\`\` Max Attendees ` +
            (this.edits_made.attendee_max?": **"+this.edits_made.attendee_max+"**\n":"\n") +
            `\`\`[6]\`\` Tags ` +
            (this.edits_made.tags?": **"+this.edits_made.tags+"**\n":"\n") +
            `\n## \`\`[back]\`\` to return to event page\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${this.event._id}`;

        return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
    }
    catch( err ) {
        console.log(err.stack);
    }
};

Viewer.prototype.getEditorView = function() {
    try {
        if(this.mode!=3) {
            return false; // something is wrong!
        }

        let page_content, footer_content;
        switch(this.edit_mode) {
            case 1:
                page_content = "" +
                    `Current title: \n\`\`${this.event.title}\`\`\n\n` +
                    "Enter the new title for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
                break;
            case 2:
                page_content = "" +
                    `Current start: \n\`\`${moment(this.event.start).format(`${config.moment_date_format}`)}\`\`\n\n` +
                    "Enter the new start time for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
                break;
            case 3:
                page_content = "" +
                    `Current start: \n\`\`${moment(this.event.end).format(`${config.moment_date_format}`)}\`\`\n\n` +
                    "Enter the new end time for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
                break;
            case 4:
                page_content = "" +
                    `Current Description: \n\`\`\`md\n${this.event.description}\n\`\`\`\n` +
                    "Enter a new description for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
                break;
            case 5:
                page_content = "" +
                    `Current maximum member count: \n\`\`${this.event.attendee_max}\`\`\n\n` +
                    "Enter a new maximum member count for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
                break;
            case 6:
                page_content = "" +
                    `Current set tags: \n\`\`${this.event.tags}\`\`\n\n` +
                    "Enter a new set of tags for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {color: msg_color, description: page_content, footer: {text: footer_content}}};
                break;
            default:
                return false; // something is wrong!
                //break; unreachable break
        }
    }
    catch(err) {
        console.log(err.stack);
    }

};

Viewer.prototype.deleteEvent = function(event) {
    this.mode = 4;

    // delete the eventDocument and return to main page
    event.remove();
    this.events.remove(event);

    this.server.save(err => {
        if(err) {
            // TODO if failure, give the user some indication
        } else {
            // TODO if success, do likewise
        }
    });

    let body = `Event #${event._id} is queued for removal.\n\n` +
        `## \`\`[back]\`\` to return to event list\n` +
        `## \`\`[exit]\`\` to exit event viewer`;
    return {embed: {color: msg_color, description: body}};
};

Viewer.prototype.joinEvent = function(event, msgAuthor) {
    this.mode = 5;
    let alreadyMember = false;

    // check if msgAuthor is already an Attendee
    for (let i = 0; i < event.attendees.length; i++) {
        if (event.attendees[i]._id === msgAuthor) {
            alreadyMember = true;
        }
    }
    //check if msgAuthor alredy joined that event
    if (alreadyMember) {

        let body = `You __already__ joined the Event #${event._id}.\n\n` +
        `Title: \`\`${event.title}\`\`\n` +
        `Author: <@${event._author}>\n` +
        `Attendees: (${event.attendees.length}/${event.attendee_max})\n\n` +
        `## \`\`[back]\`\` to return to event list\n` +
        `## \`\`[exit]\`\` to exit event viewer`;

        return {embed: {color: msg_color, description: body}};
    
    //if user is not already an attendee of the event
    } else {
        // check if attendee_max limit of eventDocument is reached
        if (event.attendees.length < event.attendee_max) {

            event.attendees.push({_id: msgAuthor, timestamp: Date()});
            this.server.save(err => {
                if(err) {
                    // TODO if failure, give the user some indication
                } else {
                    // TODO if success, do likewise
                }  
            });

            let body = `You just joined Event #${event._id}.\n\n` +
                `Title: \`\`${event.title}\`\`\n` +
                `Author: <@${event._author}>\n` +
                `Attendees: (${event.attendees.length}/${event.attendee_max})\n\n` +
                `## \`\`[back]\`\` to return to event list\n` +
                `## \`\`[exit]\`\` to exit event viewer`;
                return {embed: {color: msg_color, description: body}};
                
        } else {

            let body = `You cannot join Event #${event._id} because there is no open slot left.\n\n` +
                `Title: \`\`${event.title}\`\`\n` +
                `Author: <@${event._author}>\n` +
                `Attendees: (${event.attendees.length}/${event.attendee_max})\n\n` +
                `## \`\`[back]\`\` to return to event list\n` +
                `## \`\`[exit]\`\` to exit event viewer`;
            return {embed: {color: msg_color, description: body}};
        }

        }
};

module.exports = Viewer;

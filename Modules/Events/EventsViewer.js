const moment = require("moment");

const config = require("../../Configuration/config.json");
let msg_color = 0xff8c00; //start with orange embed color
let default_color = 0xff8c00; // default color = orange

function Viewer(serverDocument, page_size, filter) {
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
            this.filter_disp += " | author: <@" + filter._author + ">";
        }
        if(filter.tags) {
            this.filter_disp += " | tags: " + filter.tags;
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
        let title_content = "";
        msg_color = default_color;

        if((page_no-1)*page_size < events_length) {
            let start_index = (page_no - 1) * page_size;
            let end_index = (start_index + page_size) > events_length ? events_length : start_index + 3;
            //let actualAttendees = this.events.attendees.length;

            for (let i = start_index; i < end_index; i++) {
                page_content += `\`[${this.events[i]._id}]\` | \`${this.events[i].title}\`\n` +
                    `by <@${this.events[i]._author}> | [${this.events[i].attendees.length}/${this.events[i].attendee_max}]` +
                    (moment(this.events[i].start).isAfter(moment.now()) ?
                        ` | starts ${moment(this.events[i].start).fromNow()}` : ` | ends ${moment(this.events[i].end).fromNow()}\n`) +
                    "\n";
            }

            if(events_length > end_index) {
                page_content += `## \`\`[+]\`\` next page\n`;
            }
            if(page_no>1){
                page_content += `## \`\`[-]\`\` previous page\n`;
            }
            footer_content = `page (${page_no}/${Math.ceil(events_length/page_size)})`;
            title_content = `Type the Event 🆔 to show details`;
        }
        else {
            title_content = `There are no events scheduled on this server.`;
            page_content = "";  // no entries
            footer_content = "page (1/1)";
        }

        footer_content += ` | type [Q]uit to leave menu`;

        if(this.filter_disp){

            page_content += `\n## filter: ${this.filter_disp}`;
        } else {
           footer_content += ` | unfiltered`;
        }

        return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
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
        
        let title_content, page_content, footer_content;
        msg_color = default_color;
        title_content = `Event #⃣ ${this.event._id}`;
        page_content = "" +
            `Title: **${this.event.title}**\n` +
            `Author: <@${this.event._author}>\n\n` +
            `Start: **${moment(this.event.start).format(`${config.moment_date_format}`)}**\n` +
            `End: **${moment(this.event.end).format(`${config.moment_date_format}`)}**\n\n` +
            `Tags: **${this.event.tags}**\n` +
            `Description: \n\`\`\`md\n${this.event.description}\n\`\`\`\n` +
            `Attendees: \`(${this.event.attendees.length}/${this.event.attendee_max})\``;

        footer_content = `## Options: [J]oin, [L]eave, [E]dit, [D]elete, [B]ack, [Q]uit`;

        return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
    }
    catch(err) {
        console.log(err.stack);
    }
};

Viewer.prototype.getEventEditView = function() {
    try {
        this.mode = 3;
        let title_content, page_content, footer_content;
        msg_color = default_color;
        title_content = `Event #⃣ ${this.event._id}`;
        page_content = "" +
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
            (this.edits_made.tags?": **"+this.edits_made.tags+"**\n":"\n");

        footer_content = `## Options: [B]ack, [Q]uit`;

        return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
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
        msg_color = default_color;
        let title_content, page_content, footer_content;
        switch(this.edit_mode) {
            case 1:
                title_content = `Event #⃣ ${this.event._id}`;
                page_content = "" +
                    `Current title: \n\`\`${this.event.title}\`\`\n\n` +
                    `Enter the new title for the event`;

                footer_content = `## Options: [B]ack, [Q]uit`;

                return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
                break;
            case 2:
                title_content = `Event #⃣ ${this.event._id}`;
                page_content = "" +
                    `Current start: \n\`\`${moment(this.event.start).format(`${config.moment_date_format}`)}\`\`\n\n` +
                    "Enter the new start time for the event.";

                footer_content = `## Options: [B]ack, [Q]uit`;

                return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
                break;
            case 3:
                title_content = `Event #⃣ ${this.event._id}`;
                page_content = "" +
                    `Current end: \n\`\`${moment(this.event.end).format(`${config.moment_date_format}`)}\`\`\n\n` +
                    "Enter the new end time for the event.";

                footer_content = `## Options: [B]ack, [Q]uit`;

                return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
               break;
            case 4:
                title_content = `Event #⃣ ${this.event._id}`;
                page_content = "" +
                    `Current Description: \n\`\`\`md\n${this.event.description}\n\`\`\`\n` +
                    "Enter a new description for the event.";

                footer_content = `## Options: [B]ack, [Q]uit`;

                return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
                break;
            case 5:
                title_content = `Event #⃣ ${this.event._id}`;
                page_content = "" +
                    `Current maximum member count: \n\`\`${this.event.attendee_max}\`\`\n\n` +
                    "Enter a new maximum member count for the event.";

                footer_content = `## Options: [B]ack, [Q]uit`;

                return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
                break;
            case 6:
                title_content = `Event #⃣ ${this.event._id}`;
                page_content = "" +
                    `Current set tags: \n\`\`${this.event.tags}\`\`\n\n` +
                    "Enter a new set of tags for the event.";

                footer_content = `## Options: [B]ack, [Q]uit`;

                return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
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
    
    msg_color = 0x17f926; //green color
    let body = `ℹ Event #${event._id} is queued for removal.`;
    let footer_content = `## Options: [B]ack, [Q]uit`;
    return {embed: {color: msg_color, description: body, footer: {text: footer_content}}};
};

Viewer.prototype.joinEvent = function(event, msgAuthor) {
    this.mode = 4;
    let alreadyMember = false;

    // check if msgAuthor is already an Attendee
    for (let i = 0; i < event.attendees.length; i++) {
        if (event.attendees[i]._id === msgAuthor) {
            alreadyMember = true;
        }
    }
    //check if msgAuthor alredy joined that event
    let title_content, page_content, footer_content;
    if (alreadyMember) {
        msg_color = 0xecf925; //yellow color
        title_content = `⚠ You __already__ joined the Event #${event._id}.`;
        page_content =  `Title: \`\`${event.title}\`\`\n` +
                        `Author: <@${event._author}>\n` +
                        `Attendees: (${event.attendees.length}/${event.attendee_max})`;
        footer_content = `## Options: [B]ack, [Q]uit`;
        return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
    
    //if user is not already an attendee of the event
    } else {
        // Event attendee_max limit is not reached yet
        if (event.attendees.length < event.attendee_max) {

            event.attendees.push({_id: msgAuthor, timestamp: Date.now()});
            this.server.save(err => {
                if(err) {
                    // TODO if failure, give the user some indication
                } else {
                    // TODO if success, do likewise
                }  
            });
            msg_color = 0x17f926; //green color
            title_content = `ℹ You just joined Event #${event._id}.`;
            page_content =  `Title: \`\`${event.title}\`\`\n` +
                            `Author: <@${event._author}>\n` +
                            `Attendees: (${event.attendees.length}/${event.attendee_max})`;
            footer_content = `## Options: [B]ack, [Q]uit`;
            return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};

        // Event attendee_max limit is already reached   
        } else {
            msg_color = 0xecf925; //yellow color
            title_content = `⚠ You cannot join Event #${event._id} because there is no open slot left.`;
            page_content =  `Title: \`\`${event.title}\`\`\n` +
                            `Author: <@${event._author}>\n` +
                            `Attendees: (${event.attendees.length}/${event.attendee_max})`;
            footer_content = `## Options: [B]ack, [Q]uit`;
            return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
        }

        }
};

Viewer.prototype.leaveEvent = function(event, msgAuthor) {
    this.mode = 4;
    let wasMember = false;
    let title_content, page_content, footer_content;

    // check if msgAuthor is an Attendee and delete that entry
    for (let i = 0; i < event.attendees.length; i++) {
        if (event.attendees[i]._id == msgAuthor) {
            wasMember = true;
            event.attendees.splice(i,1);
            
            this.server.save(err => {
                if(err) {
                    // TODO if failure, give the user some indication
                } else {
                    // TODO if success, do likewise
                }  
            });
            break;
        }
    }
    // msgAuthor was an attendee of the event
    if (wasMember) {
            
            msg_color = 0x17f926; //green color
            title_content = `ℹ You left the Event #${event._id}.`;
            page_content =  `Title: \`\`${event.title}\`\`\n` +
                            `Author: <@${event._author}>\n` +
                            `Attendees: (${event.attendees.length}/${event.attendee_max})`;
            footer_content = `## Options: [B]ack, [Q]uit`;
            return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
    
    // msgAuthor was no attendee of the event
    } else {
            msg_color = 0xecf925; //yellow color
            title_content = `⚠ You are not an attendee of the Event #${event._id}.`;
            page_content =  `Title: \`\`${event.title}\`\`\n` +
                            `Author: <@${event._author}>\n` +
                            `Attendees: (${event.attendees.length}/${event.attendee_max})`;
            footer_content = `## Options: [B]ack, [Q]uit`;
            return {embed: {color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};

    }       
};


module.exports = Viewer;

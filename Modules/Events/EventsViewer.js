const moment = require("moment-timezone");
const config = require("../../Configuration/config.json");
const auth = require("./AdminOrAuthor");

let msg_color = 0xff8c00; //start with orange embed color
let default_color = 0xff8c00; // default color = orange


/*jshint -W027*/
/// events viewer constructor
function Viewer(db, serverDocument, eventDocuments, userDocument, memberObject, page_size, filter) {
    this.db = db;
    this.server = serverDocument;
    this.events = eventDocuments;
    this.user = userDocument;
    this.member = memberObject;
    this.page_size = page_size ? page_size : 5;

    this.mode = 0;
    this.previous_mode = 0;
    this.edit_mode = 0;
    this.edits_made = {};
    this.add_not_edit = false;
    this.timezone = (this.user.timezone?this.user.timezone:config.moment_timezone);

    // set the filter display
    this.filter_disp = "";
    if (filter) {
        if (filter._author) {
            this.filter_disp += " | author: <@" + filter._author + ">";
        }
        if (filter.tags) {
            this.filter_disp += " | tags: " + filter.tags;
        }
    }
}

/// set the viewer's current event
Viewer.prototype.setEvent = function(event_no) {
    let event;
    for (let i = 0; i < this.events.length; i++) {
        if (this.events[i]._no == event_no) {
            event = this.events[i];
        }
    }

    if (event) {
        this.event = event;
        return true;
    }
};

/// generate a list view embed
Viewer.prototype.getPageView = function(page_no) {
    let events_length = this.events.length;
    this.mode = 1;

    let page_content = "",
        footer_content = "",
        title_content = "";
    let embed_fields = [];
    let embed_author;
    msg_color = default_color;

    if ((page_no - 1) * this.page_size < events_length) {
        let start_index = (page_no - 1) * this.page_size;
        let end_index = (start_index + this.page_size) > events_length ? events_length : start_index + this.page_size;

        for (let i = start_index; i < end_index; i++) {
            page_content += `**[${this.events[i]._no}]** | **${this.events[i].title}**\n` +
                `by <@${this.events[i]._author}> | [${this.events[i].attendees.length}/${this.events[i].attendee_max}]` +
                (moment(this.events[i].start).isAfter(moment.now()) ?
                    ` | starts ${moment(this.events[i].start).fromNow()}` : ` | ends ${moment(this.events[i].end).fromNow()}`) +
                "\n\n";
        }

        if (events_length > end_index) {
            page_content += `\n## \`\`[+]\`\` next page`;
        }
        if (page_no > 1) {
            page_content += ` | \`\`[-]\`\` previous page\n`;
        }
        footer_content = `page (${page_no}/${Math.ceil(events_length/this.page_size)})`;
        title_content = `Type the Event 🆔 to show details`;
    } else {
        title_content = `There are no events scheduled on this server.`;
        page_content = ""; // no entries
        footer_content = "page (1/1)";
    }

    footer_content += ` | type [Q]uit to leave` + this.filter_disp;
    embed_author = { name: `EVENT CREATION PROCESS` };

    return { embed: { author: embed_author, color: msg_color, title: title_content, description: page_content, fields: embed_fields, footer: { text: footer_content } } };
};

/// generate a view of a single event
Viewer.prototype.getEventView = function() {
        this.mode = 2;
        let attendeesNames = "";
        let hasAttendees = false;

        if (typeof this.event.attendees !== "undefined" && this.event.attendees.length > 0) {
            for (let i = 0; i<this.event.attendees.length;i++) {
                if (i >14) { //showing max 15 attendees
                    break;
                } else {
                    attendeesNames += `<@`+this.event.attendees[i]._id+`>, `;
                    hasAttendees = true;
                }
            }
        }

        let title_content, page_content, footer_content, embed_author;
        msg_color = default_color;
        embed_author = {
            name: `EVENT OVERVIEW PROCESS`
        };
        title_content = `Event #⃣ ${this.event._no}`;
        page_content = "" +
        `Title: **${this.event.title}**\n` +
        `Author: <@${this.event._author}>\n\n` +
        `Start: **${moment(this.event.start).tz(this.timezone).format(`${config.moment_date_format}`)}**\n` +
        `End: **${moment(this.event.end).tz(this.timezone).format(`${config.moment_date_format}`)}**\n\n` +
        `Tags: **${this.event.tags.join(", ")} **\n` +
        `Description: \n\`\`\`md\n${this.event.description}\n\`\`\`\n` +
        `Attendees: \`[${this.event.attendees.length}/${this.event.attendee_max}]\`\n` +
        (hasAttendees ? `(${attendeesNames})` : `(no attendees)`);

    footer_content = `## Options: [J]oin, [L]eave, ` +
        (hasAttendees ? `[A]ttendees, ` : "") +
        (auth(this.server, this.event, this.member)?`[E]dit, [D]elete, `:"") + `[B]ack, [Q]uit`;
    return {embed: {author: embed_author, color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
};

/// generate the main editor view for the currently set event
Viewer.prototype.getEventEditView = function(add) {
    this.mode = 3;
    this.edit_mode = 0;


    //check if view comes from add or from edit command
    if (add) {
        this.add_not_edit = true;
    }

    let title_content, page_content, footer_content, embed_author;

    if(this.add_not_edit) {
        embed_author = {name: `CREATION PROCESS`};
        footer_content = `## Options: [S]ave, [Q]uit`;
    } else {
        embed_author = {name: `EDIT PROCESS`};
        footer_content = `## Options: [S]ave, [C]ancel, [Q]uit`;
    }

    msg_color = default_color;
    title_content = `Event #⃣ ${this.event._no}`;
    page_content = "" +
        `\`\`[1]\`\` **Event Title** ` +
        (this.edits_made.title?": \`"+this.edits_made.title+"\`\n":
        "\`"+this.event.title+"\`\n") +
        `\`\`[2]\`\` **Start Time**` +
        (this.edits_made.start?": \`"+moment(this.edits_made.start).tz(this.timezone).format(`${config.moment_date_format}`)+"\`\n":
        ": \`"+moment(this.event.start).tz(this.timezone).format(`${config.moment_date_format}`)+"\`\n") +
        `\`\`[3]\`\` **End Time** ` +
        (this.edits_made.end?": \`"+moment(this.edits_made.end).tz(this.timezone).format(`${config.moment_date_format}`)+"\`\n":
         ": \`"+moment(this.event.end).tz(this.timezone).format(`${config.moment_date_format}`)+"\`\n") +
        `\`\`[4]\`\` **Description** ` +
        (this.edits_made.description?"```md\n"+this.edits_made.description+"```\n":
         ": \`"+this.event.description+"\`\n") +
        `\`\`[5]\`\` **Max Attendees** ` +
        (this.edits_made.attendee_max?": \`"+this.edits_made.attendee_max+"\`\n":
         ": \`"+this.event.attendee_max+"\`\n") +
        `\`\`[6]\`\` **Tags** ` +
        (this.edits_made.tags?": \`"+this.edits_made.tags.join(", ")+"\`\n":
         ": \`"+this.event.tags+"\`\n");

    return {embed: {author: embed_author, color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
};

/// generate the edit [attribute] prompt
Viewer.prototype.getEditorView = function() {
    if(this.mode!=3) {
        return false; // something is wrong!
    }
    msg_color = default_color;
    let title_content, page_content, footer_content, embed_author;

    title_content = `Event #⃣ ${this.event._no}`;
    if(this.add_not_edit) {
        embed_author = {name: `CREATION PROCESS`};
        footer_content = `## Options: [Q]uit`;
    } else {
        embed_author = {name: `EDIT PROCESS`};
        footer_content = `## Options: [C]ancel, [Q]uit`;
    }

    switch(this.edit_mode) {
        case 1:
            page_content = "" +
                `Current title: \n\`\`${this.event.title}\`\`\n\n` +
                `Enter the new title for the event`;
            break;
        case 2:
            let start = moment(this.event.start).tz(this.timezone).format(`${config.moment_date_format}`);
            page_content = "" +
                `Current start: \n\`\`${start}\`\`\n\n` +
                `Enter the start end time for the event.\n\n` + 
                `# Format: YYYY/MM/DD hh:mm`;
            break;
        case 3:
            let end = moment(this.event.end).tz(this.timezone).format(`${config.moment_date_format}`);
            page_content = "" +
                `Current end: \n\`\`${end}\`\`\n\n` +
                `Enter the new end time for the event.\n\n` + 
                `# Format: YYYY/MM/DD hh:mm`;
            break;
        case 4:
            page_content = "" +
                `Current Description: \n\`\`\`md\n${this.event.description}\n\`\`\`\n` +
                "Enter a new description for the event.";
            break;
        case 5:
            page_content = "" +
                `Current maximum member count: \`\`${this.event.attendee_max}\`\`\n\n` +
                "Enter a new maximum member count for the event.";
            break;
        case 6:
            page_content = "" +
                `Current set tags: ${(this.event.tags.length?"``"+this.event.tags.join(", ")+"``":"")}\n\n` +
                "Enter a new set of tags for the event.";
            break;
        default:
            page_content = `Something went wrong if this is being read!`;
            break;
    }

    return {embed: {author: embed_author, color: msg_color, title: title_content, description: page_content, footer: {text: footer_content}}};
};

/// remove an event and return an event removed prompt
Viewer.prototype.deleteEvent = function(event, silent) {
    this.mode = 4;

    // delete the eventDocument and return to main page
    this.db.events.remove({_id: event._id}, (err)=>{
        if(err) {
            console.log(err.stack);
        }
    });
    for(let i=0; i<this.events.length; i++){
        if(this.events[i]._id===event._id) {
            this.events.splice(i,1);
        }
    }

    msg_color = 0x17f926; //green color
    let body = `ℹ Event #${event._id} is queued for removal.`;
    let embed_author = {name: `EVENT DELETION PROCESS`};

    if(silent) {
        return {embed: {author: embed_author, color: msg_color, description: body}};
    }
    let footer_content = `## Options: [B]ack, [Q]uit`;
    return {embed: {author: embed_author, color: msg_color, description: body, footer: {text: footer_content}}};
};

/// add a user to an event and generate a prompt
Viewer.prototype.joinEvent = function(event, msg) {
    let alreadyMember = false;

    // check if msgAuthor is already an Attendee
    for (let i = 0; i < event.attendees.length; i++) {
        if (event.attendees[i]._id === msg.author.id) {
            alreadyMember = true;
            break;
        }
    }
    //check if msgAuthor already joined that event
    let title_content, page_content;
    if (alreadyMember) {
        
        msg_color = 0xecf925; //yellow color
        title_content = `⚠ ${msg.author.username} __already__ joined the Event #${event._no}.`;
        page_content =  `Title: \`\`${event.title}\`\`\n` +
                        `Author: <@${event._author}>\n` +
                        `Attendees: [${event.attendees.length}/${event.attendee_max}]`;
        return {embed: {color: msg_color, title: title_content, description: page_content}};

    //if user is not already an attendee of the event
    } else {
        // Event attendee_max limit is not reached yet
        if (event.attendees.length < event.attendee_max) {

            event.attendees.push({_id: msg.author.id, timestamp: Date.now()});
            event.save(err => {
                if(err) {
                    console.log(err.stack);
                }
            });
            msg_color = 0x17f926; //green color
            title_content = `ℹ ${msg.author.username} just joined Event #${event._no}.`;
            page_content =  `Title: \`\`${event.title}\`\`\n` +
                            `Author: <@${event._author}>\n` +
                            `Attendees: [${event.attendees.length}/${event.attendee_max}]`;
            return {embed: {color: msg_color, title: title_content, description: page_content}};

        // Event attendee_max limit is already reached   
        } else {
            msg_color = 0xecf925; //yellow color
            title_content = `⚠ ${msg.author.username} cannot join Event #${event._no} because there is no open slot left.`;
            page_content =  `Title: \`\`${event.title}\`\`\n` +
                            `Author: <@${event._author}>\n` +
                            `Attendees: [${event.attendees.length}/${event.attendee_max}]`;
            return {embed: {color: msg_color, title: title_content, description: page_content}};
        }
    }
};

/// remove a user from an event and generate a prompt
Viewer.prototype.leaveEvent = function(event, msg) {
    let wasMember = false;
    let title_content, page_content;

    // check if msgAuthor is an Attendee and delete that entry
    for (let i = 0; i < event.attendees.length; i++) {
        if (event.attendees[i]._id === msg.author.id) {
            wasMember = true;
            event.attendees.splice(i,1);
            
            event.save(err => {
                if(err) {
                    console.log(err.stack);
                }
            });
            break;
        }
    }
    
    // msgAuthor was an attendee of the event
    if (wasMember) {
        msg_color = 0x17f926; //green color
        title_content = `ℹ ${msg.author.username} left the Event #${event._no}.`;
        page_content =  `Title: \`\`${event.title}\`\`\n` +
            `Author: <@${event._author}>\n` +
            `Attendees: [${event.attendees.length}/${event.attendee_max}]`;
        return {embed: {color: msg_color, title: title_content, description: page_content}};

    // msgAuthor was not an attendee of the event
    } else {
        msg_color = 0xecf925; //yellow color
        title_content = `⚠ ${msg.author.username} is not an attendee of the Event #${event._no}.`;
        page_content =  `Title: \`\`${event.title}\`\`\n` +
            `Author: <@${event._author}>\n` +
            `Attendees: [${event.attendees.length}/${event.attendee_max}]`;
        return {embed: {color: msg_color, title: title_content, description: page_content}};
    }
};

Viewer.prototype.getErrorView = function(error, bad_input, silent) {
    this.previous_mode = this.mode;
    this.mode = 5;

    let title, body;
    title = `⚠ There was an error! `;

    switch(error) {
        case 1:
            body = `Your input ${bad_input} is not a number from the list!`;
            break;
        case 2:
            body = `Event #${bad_input} does not exists!`;
            break;
        case 3:
            body = `\"${bad_input}\" is not a valid start time!`;
            break;
        case 4:
            body = `\"${bad_input}\" is not a valid end time!`;
            break;
        case 5:
            body = `\"${bad_input}\" is not valid amount!`;
            break;
        default:
            body = `Unknown error!`;
            break;
    }

    if(silent) {
        return {embed: {color: 0xecf925, title: title, description: body}};
    }

    body += `\n\nYou can return to the edit menu, or quit`;
    let footer_content = `## Options: [B]ack, [Q]uit`;
    return {embed: {color: 0xecf925, title: title, description: body, footer: {text: footer_content}}};
};

Viewer.prototype.getEventAttendeesView = function(event) {
    this.previous_mode = this.mode;
    this.mode = 6;

    let title = `ℹ List of attendees for #⃣ ${event._no}`;
    let body = "";

    if (event.attendees.length > 0) {
        for (let i=0; i<this.event.attendees.length;i++) {
            body += `<@`+this.event.attendees[i]._id+`>, `;
        }
    }
    let footer_content = `## Options: [B]ack, [Q]uit`;
    return {embed: {color: 0xffffff, title: title, description: body, footer: {text: footer_content}}};
};

module.exports = Viewer;
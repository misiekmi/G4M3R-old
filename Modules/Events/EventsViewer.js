const moment = require("moment");

function Viewer(serverDocument, page_size, filter) {
    this.server = serverDocument;
    this.events = [];
    this.page_size = page_size ? page_size : 3;
    this.mode = 0;
    this.edit_mode = 0;

    if(filter) {
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
        this.isFiltered = true;
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

            for (let i = start_index; i < end_index; i++) {
                page_content += `\`\`[${this.events[i]._id}]\`\` ${this.events[i].title}\n` +
                    `-by: <@${this.events[i]._author}>\n` +
                    `-start: ${moment(this.events[i].start).format(`MMM D @ HH:mm`)}\n\n`;
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
        if(this.isFiltered){
            footer_content += "  |  filtered";
        } else {
            footer_content += "  |  unfiltered";
        }

        return {embed: {description: page_content, footer: {text: footer_content}}};
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
            `Title: ${this.event.title}\n` +
            `Author: <@${this.event._author}>\n` +
            `Start: ${this.event.start}\n` +
            `End: ${this.event.end}\n` +
            `Description: ${this.event.description}\n` +
            `Tags: ${this.event.tags}\n` +
            `Attendee Count: ${this.event.attendees.length}\n` +
            `Attendee Max: ${this.event.attendee_max}\n` +
            `\n##\`\`[edit]\`\` to edit the event\n` +
            `##\`\`[delete]\`\` to delete the event\n` +
            `## \`\`[back]\`\` to return to event list\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${this.event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
    }
    catch(err) {
        console.log(err.stack);
    }
};

Viewer.prototype.getEventEditView = function() {
    try {
        this.mode = 3;

        let page_content = "" +
            `\`\`[1]\`\` Title: ${this.event.title}\n` +
            `\`\`[2]\`\` Start: ${this.event.start}\n` +
            `\`\`[3]\`\` End: ${this.event.end}\n` +
            `\`\`[4]\`\` Desc: ${this.event.description}\n` +
            `\`\`[5]\`\` Max Members: ${this.event.attendee_max}\n` +
            `\`\`[6]\`\` Tags: ${this.event.tags}\n` +
            `\n## \`\`[back]\`\` to return to event page\n` +
            `## \`\`[exit]\`\` to exit the menu`;

        let footer_content = `event ID# ${this.event._id}`;

        return {embed: {description: page_content, footer: {text: footer_content}}};
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
                    `Current title: \`\`${this.event.title}\`\`\n` +
                    "Enter the new title for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {description: page_content, footer: {text: footer_content}}};
                //break; unreachable break
            case 2:
                page_content = "" +
                    `Current start: \`\`${this.event.start}\n\`\`` +
                    "Enter the new start time for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {description: page_content, footer: {text: footer_content}}};
                //break; unreachable break
            case 3:
                page_content = "" +
                    `Current start: \`\`${this.event.end}\n\`\`` +
                    "Enter the new end time for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {description: page_content, footer: {text: footer_content}}};
                //break; unreachable break
            case 4:
                page_content = "" +
                    `Current Description: \n\`\`${this.event.description}\`\`\n\n` +
                    "Enter the new end time for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {description: page_content, footer: {text: footer_content}}};
                //break; unreachable break
            case 5:
                page_content = "" +
                    `Current maximum member count: \n\`\`${this.event.attendee_max}\`\`\n\n` +
                    "Enter a new maximum member count for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {description: page_content, footer: {text: footer_content}}};
                break;
            case 6:
                page_content = "" +
                    `Current set tags: \n\`\`${this.event.tags}\`\`\n\n` +
                    "Enter a new set of tags for the event, or\n\n" +
                    `## \`\`[back]\`\` to return to event edit page\n` +
                    `## \`\`[exit]\`\` to exit the menu`;

                footer_content = `event ID# ${this.event._id}`;

                return {embed: {description: page_content, footer: {text: footer_content}}};
                //break; unreachable break
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
    return {embed: {description: body}};
};

module.exports = Viewer;

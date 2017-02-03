const moment = require("moment");

function Viewer(serverDocument, page_size, filter) {
    this.server = serverDocument;
    this.events = [];
    this.page_size = page_size ? page_size : 3;

    if(filter) {
        for(let event in serverDocument.gameEvents) {
            let pass = true;
            if(filter._author && event._author != filter._author) {
                pass = false;
            } else if(filter.tags) {
                for(let i=0; i<filter.tags.length; i++) {
                    let found = false;
                    for(let j=0; j<event.tags.length; j++) {
                        if(filter.tags[i] = event.tags[j]) {
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
    let events_length = this.events.length;
    let page_size = this.page_size;
    this.mode = 1;

    let page_content = "";
    let footer_content = "";
    if((page_no-1)*page_size < events_length) {
        let start_index = (page_no - 1) * page_size;
        let end_index = (start_index + page_size) > events_length ? events_length : start_index + 3;

        for (let i = start_index; i < end_index; i++) {
            page_content += `\`\`[${this.events[i]._id}]\`\` **${this.events[i].title}\n` +
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
        footer_content += "  |  filtered"
    } else {
        footer_content += "  |  unfiltered"
    }

    return {embed: {description: page_content, footer: {text: footer_content}}};
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

Viewer.prototype.getEventView = function(event) {
    this.mode = 2;

    let page_content = "" +
        `Title: ${event.title}\n` +
        `Author: <@${event._author}>\n` +
        `Start: ${event.start}\n` +
        `End: ${event.end}\n` +
        `Description: ${event.description}\n` +
        `Tags: ${event.tags}\n` +
        `Attendee Count: ${event.attendees.length}\n` +
        `Attendee Max: ${event.attendee_max}\n` +
        //`\n##\`\`[edit]\`\` to edit the event\n` +
        `\n##\`\`[delete]\`\` to delete the event\n` +
        `## \`\`[back]\`\` to return to event list\n` +
        `## \`\`[exit]\`\` to exit the menu`;

    let footer_content = `event ID# ${event._id}`;

    return {embed: {description: page_content, footer: {text: footer_content}}};
};

Viewer.prototype.getEventEditView = function(event) {
    let page_content = "" +
        `\`\`[1]\`\` Title: ${event.title}\n` +
        `\`\`[2]\`\` Start: ${event.start}\n` +
        `\`\`[3]\`\` End: ${event.end}\n` +
        `\`\`[4]\`\` Desc: ${event.description}\n` +
        `\`\`[5]\`\` Max Members: ${event.attendee_max}\n\n` +
        //`\`\`[6]\`\` Tags: ${event.tags}\n` +
        `## \`\`[back]\`\` to return to event page\n` +
        `## \`\`[exit]\`\` to exit the menu`;

    let footer_content = `event ID# ${event._id}`;

    return {embed: {description: page_content, footer: {text: footer_content}}};
};

Viewer.prototype.deleteEvent = function(event) {
    // delete the eventDocument and return to main page
    event.remove();
    this.events.remove(event);

    this.server.save(err => {
        if(err) {
            let body = `Uh-Oh! I failed to remove event #${event._id}!\n\n` +
                `## \`\`[back]\`\` to return to event list\n` +
                `## \`\`[exit]\`\` to exit event viewer`;
            return {embed: {description: body}}
        } else {
            let body = `Event #${event._id} has been successfully removed!\n\n` +
                `## \`\`[back]\`\` to return to event list\n` +
                `## \`\`[exit]\`\` to exit event viewer`;
            return {embed: {description: body}}
        }
    });
};

module.exports = Viewer;

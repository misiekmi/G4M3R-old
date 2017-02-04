const create = require("./../../Modules/Events/CreateInteractive.js");
const list = require("./../../Modules/Events/InteractiveLoop.js");
const show = require("./../../Modules/Events/showEvent.js");
const EventViewer = require("./../../Modules/Events/EventsViewer");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {

    let viewer;
    const page_size = 3;

    if( suffix ) {
        if(suffix.toLowerCase()=="add") {
            create(bot, db, winston, serverDocument, msg);
        }
        if(suffix.toLowerCase()=="list") {
            let viewer = new EventViewer(serverDocument, page_size);
            list(bot, db, winston, serverDocument, msg, viewer, viewer.getPageView(1));
        }
        else if(suffix.toLowerCase().startsWith("show")) {
            let tmp = suffix.toLowerCase().split("show")[1].trim();
            viewer = new EventViewer(serverDocument, page_size);
            let event = viewer.getEvent(tmp);
            if(event){
                viewer.event = event;
                list(bot, db, winston, serverDocument, msg, viewer, viewer.getEventView());
            } else {
                // TODO error, event does not exist
            }
        }
        else if(suffix.toLowerCase().startsWith("remove")) {
            let tmp = suffix.toLowerCase().split("remove")[1].trim();
            viewer = new EventViewer(serverDocument, page_size);
            viewer.event = viewer.getEvent(tmp);
            if(viewer.event) {
                list(bot, db, winston, serverDocument, msg, viewer, viewer.deleteEvent(viewer.event));
            } else {
                // TODO error, event does not exist
            }
        }
        else if(suffix.toLowerCase().startsWith("edit")) {
            let tmp = suffix.toLowerCase().split("edit")[1].trim();
            viewer = new EventViewer(serverDocument, page_size);
            let event = viewer.getEvent(tmp);
            if(event){
                viewer.event = event;
                list(bot, db, winston, serverDocument, msg, viewer, viewer.getEventEditView());
            } else {
                // TODO error, event does not exist
            }
        }
        else if(suffix.toLowerCase().startsWith("search")) {
            // TODO parse args to make a filter
            let filter = null;
            viewer = new EventViewer(serverDocument, page_size, filter);
            list(bot, db, winston, serverDocument, msg, viewer, viewer.getPageView(1));
        }
    }
    else {
        // TODO
    }
};
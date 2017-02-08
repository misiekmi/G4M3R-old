const list = require("./../../Modules/Events/InteractiveLoop.js");
const EventViewer = require("./../../Modules/Events/EventsViewer");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {

    let viewer;

    const page_size = 5;

    if( suffix ) {
        if(suffix.toLowerCase()=="add") {
            let newEventID, maxEventID;
            if (serverDocument.gameEvents.length === 0) {
                maxEventID = 0;
            } else {
                maxEventID = Math.max.apply(Math, serverDocument.gameEvents.map(a => a._id));
            }
            newEventID = maxEventID + 1;
            serverDocument.gameEvents.push({_id: newEventID, _author: msg.author.id});
            let viewer = new EventViewer(serverDocument, page_size);

            let event = viewer.getEvent(newEventID);
            if(event){
                viewer.event = event;
                list(bot, db, winston, serverDocument, msg, viewer, viewer.getEventEditView());
            } else {
                // TODO error, event does not exist
            }
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
            let filter = {};
            let args = suffix.toLowerCase().split("search")[1].trim().split("|");
            for(let i=0; i<args.length; i++){
                let arg = args[i].trim();

                let attribute = arg.split(":")[0].trim();
                let instance = arg.split(":")[1].trim();
                switch(attribute){
                    case "a":
                        if(instance){
                            filter._author = instance.replace("<@","").replace(">","");
                        }
                        break;
                    case "t":
                        if(instance){
                            let tags = [];
                            let tmp = instance.split(" ");
                            for(let i=0; i<tmp.length; i++){
                                tags.push(tmp[i]);
                            }
                            filter.tags = tags;
                        }
                        break;
                }
            }

            viewer = new EventViewer(serverDocument, page_size, filter);
            list(bot, db, winston, serverDocument, msg, viewer, viewer.getPageView(1));
        }
    
        else if(suffix.toLowerCase().startsWith("join")) {
            let tmp = suffix.toLowerCase().split("join")[1].trim();
            viewer = new EventViewer(serverDocument, page_size);
            let event = viewer.getEvent(tmp);
            let author = msg.author.id;
            if(event){
                viewer.event = event;
                list(bot, db, winston, serverDocument, msg, viewer, viewer.joinEvent(viewer.event, author));
            } else {
                // TODO error, event does not exist
            }
        }

        else if(suffix.toLowerCase().startsWith("leave")) {
            let tmp = suffix.toLowerCase().split("leave")[1].trim();
            viewer = new EventViewer(serverDocument, page_size);
            let event = viewer.getEvent(tmp);
            let author = msg.author.id;
            if(event){
                viewer.event = event;
                list(bot, db, winston, serverDocument, msg, viewer, viewer.leaveEvent(viewer.event, author));
            } else {
                // TODO error, event does not exist
            }

        }
    }    
    else {
    }
};
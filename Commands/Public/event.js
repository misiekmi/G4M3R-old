const list = require("./../../Modules/Events/InteractiveLoop.js");
const EventViewer = require("./../../Modules/Events/EventsViewer");
const idHelper = require('../../Modules/Events/IDHelper');
const QueryHelper = require('../../Modules/Events/EventsQueryHelper');

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {

    let viewer;
    const page_size = 3;

    if( suffix ) {
        if(suffix.toLowerCase()=="add") {
            // chained promise statements to generate a new event id number for the server
            idHelper.newServerEventNumber(db,serverDocument._id).then((no) => {
                db.events.create({
                        _id: idHelper.computeID(no,msg.author.id,serverDocument._id,null),
                        _no: no, _author: msg.author.id, _server: serverDocument._id, _clan: null
                    },(err, event)=>{
                        if(err) {
                            winston.info(err.stack)
                        } else {
                            QueryHelper.findServerEvents(db, serverDocument._id).then((eventDocuments)=>{
                                let viewer = new EventViewer(db, serverDocument, eventDocuments, page_size);
                                viewer.event = event;
                                list(bot, db, winston, serverDocument, msg, viewer, viewer.getEventEditView());
                            });
                        }
                    });
            });
        }
        else if(suffix.toLowerCase()=="list") {
            QueryHelper.findServerEvents(db, serverDocument._id).then((eventDocuments)=>{
                let viewer = new EventViewer(db, serverDocument, eventDocuments, page_size);
                list(bot, db, winston, serverDocument, msg, viewer, viewer.getPageView(1));
            });
        }
        else if(suffix.toLowerCase().startsWith("show")) {
            QueryHelper.findServerEvents(db, serverDocument._id).then((eventDocuments)=> {
                let tmp = suffix.toLowerCase().split("show")[1].trim();
                viewer = new EventViewer(db, serverDocument, eventDocuments, page_size);
                let event = viewer.getEvent(tmp);
                if (event) {
                    viewer.event = event;
                    list(bot, db, winston, serverDocument, msg, viewer, viewer.getEventView());
                } else {
                    // TODO error, event does not exist
                }
            });
        }
        else if(suffix.toLowerCase().startsWith("remove")) {
            QueryHelper.findServerEvents(db, serverDocument._id).then((eventDocuments)=> {
                let tmp = suffix.toLowerCase().split("remove")[1].trim();
                viewer = new EventViewer(db, serverDocument, eventDocuments, page_size);
                viewer.event = viewer.getEvent(tmp);
                if (viewer.event) {
                    list(bot, db, winston, serverDocument, msg, viewer, viewer.deleteEvent(viewer.event));
                } else {
                    // TODO error, event does not exist
                }
            });
        }
        else if(suffix.toLowerCase().startsWith("edit")) {
            let tmp = suffix.toLowerCase().split("edit")[1].trim();
            QueryHelper.findServerEvents(db, serverDocument._id).then((eventDocuments)=> {
                viewer = new EventViewer(db, serverDocument, eventDocuments, page_size);
                let event = viewer.getEvent(tmp);
                if (event) {
                    viewer.event = event;
                    list(bot, db, winston, serverDocument, msg, viewer, viewer.getEventEditView());
                } else {
                    // TODO error, event does not exist
                }
            });
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
            QueryHelper.findFilteredServerEvents(db, serverDocument._id, filter).then((eventDocuments)=> {
                viewer = new EventViewer(db, serverDocument, eventDocuments, page_size, filter);
                list(bot, db, winston, serverDocument, msg, viewer, viewer.getPageView(1));
            });
        }
        else if(suffix.toLowerCase().startsWith("join")) {
            let author = msg.author.id;
            let tmp = suffix.toLowerCase().split("join")[1].trim();
            QueryHelper.findServerEvents(db, serverDocument._id).then((eventDocuments)=> {
                viewer = new EventViewer(db, serverDocument, eventDocuments, page_size);
                let event = viewer.getEvent(tmp);
                if (event) {
                    viewer.event = event;
                    list(bot, db, winston, serverDocument, msg, viewer, viewer.joinEvent(viewer.event, author));
                } else {
                    // TODO error, event does not exist
                }
            });
        }
        else if(suffix.toLowerCase().startsWith("leave")) {
            let author = msg.author.id;
            let tmp = suffix.toLowerCase().split("leave")[1].trim();
            QueryHelper.findServerEvents(db, serverDocument._id).then((eventDocuments)=> {
                viewer = new EventViewer(db, serverDocument, eventDocuments, page_size);
                let event = viewer.getEvent(tmp);
                if (event) {
                    viewer.event = event;
                    list(bot, db, winston, serverDocument, msg, viewer, viewer.leaveEvent(viewer.event, author));
                } else {
                    // TODO error, event does not exist
                }
            });
        }
    }    
    else {
    }
};
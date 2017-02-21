const list = require("./../../Modules/Events/InteractiveLoop.js");
const EventViewer = require("./../../Modules/Events/EventsViewer");
const QueryHelper = require('../../Modules/Events/EventsQueryHelper');

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {

    let viewer;
    const page_size = 4;

    if(!suffix) {
        // create a filter from using the author's id
        let filter = {_author: userDocument._id};
        // setup the menu
        QueryHelper.findFilteredServerEvents(db, serverDocument._id, filter).then((eventDocuments) => {
            viewer = new EventViewer(bot, msg, db, serverDocument, eventDocuments, userDocument, msg.member, page_size);
            list(bot, db, winston, serverDocument, msg, viewer, viewer.getPageView(1));
        });
    }
    else {
        msg.channel.createMessage("Do not use a suffix please!");
    }
};
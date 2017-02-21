const list = require("./../../Modules/Events/InteractiveLoop.js");
const EventViewer = require("./../../Modules/Events/EventsViewer");
const QueryHelper = require('../../Modules/Events/EventsQueryHelper');

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {

    let viewer;

    const page_size = 3;

    if(!suffix) {
        let filter = {};
        filter._author = msg.author.id;

        QueryHelper.findFilteredServerEvents(db, serverDocument._id, filter).then((eventDocuments) => {
            viewer = new EventViewer(bot, msg, db, serverDocument, eventDocuments, userDocument, msg.member, page_size);
            list(bot, db, winston, serverDocument, msg, viewer, viewer.getPageView(1));
        });

    } else {
        msg.channel.createMessage("Do not use a suffix please!");
    }
};
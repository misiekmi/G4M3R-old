const list = require("./../../Modules/Events/InteractiveLoop.js");
const EventViewer = require("./../../Modules/Events/EventsViewer");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {

    let viewer;

    const page_size = 3;

    if(!suffix) {
        let filter = {};
        filter._author = msg.author.id;

        viewer = new EventViewer(serverDocument, page_size, filter);
        list(bot, db, winston, serverDocument, msg, viewer, viewer.getPageView(1));
    }
    else {
        msg.channel.createMessage("Do not use a suffix please!");
    }
};
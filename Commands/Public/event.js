const interactive = require("./../../Modules/CreateEventInteractive.js");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {

    interactive(bot, db, winston, serverDocument, msg);

};

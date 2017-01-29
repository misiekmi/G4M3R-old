const create = require("./../../Modules/Events/CreateInteractive.js");
const list = require("./../../Modules/Events/ListInteractive.js");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {

    if( suffix ) {
        switch (suffix.toLowerCase()) {
            case "add":
                create(bot, db, winston, serverDocument, msg);
                break;
            case "list":
                list(bot, db, winston, serverDocument, msg);
                break;
        }
    }
    else {
        // probably return a help message TODO yupp
    }

};

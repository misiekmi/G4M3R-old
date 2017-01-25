const create = require("./../../Modules/ServerEventsModules/CreateInteractive.js");
const remove = require("./../../Modules/ServerEventsModules/RemoveInteractive.js");
const edit = require("./../../Modules/ServerEventsModules/EditInteractive.js");
const list = require("./../../Modules/ServerEventsModules/ListInteractive.js");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {

    if( suffix ) {
        switch (suffix.toLowerCase()) {
            case "add":
                create(bot, db, winston, serverDocument, msg);
                break;
            case "list":
                list(bot, db, winston, serverDocument, msg);
                break;
            case "remove":
                remove(bot, db, winston, serverDocument, msg);
                break;
            case "edit":
                edit(bot, db, winston, serverDocument, msg);
                break;
        }
    }
    else {
        // probably return a help message TODO
    }

};

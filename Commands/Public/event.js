const create = require("./../../Modules/Events/CreateInteractive.js");
const remove = require("./../../Modules/Events/RemoveInteractive.js");
const edit = require("./../../Modules/Events/EditInteractive.js");
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

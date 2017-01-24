const create = require("./../../Modules/ServerEventsModules/CreateInteractive.js");
const remove = require("./../../Modules/ServerEventsModules/RemoveInteractive.js");
const edit = require("./../../Modules/ServerEventsModules/EditInteractive.js");
const list = require("./../../Modules/ServerEventsModules/ListInteractive.js");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {

    if( suffix ) {
        if( suffix=="add" ){
            create(bot, db, winston, serverDocument, msg);
        }
        else if( suffix=="list" ){
            list(bot, db, winston, serverDocument, msg);
        }
        else if( suffix=="remove" ) {
            remove(bot, db, winston, serverDocument, msg);
        }
        else if( suffix=="edit" ) {
            edit(bot, db, winston, serverDocument, msg);
        }
    }
    else {
        // probably return a help message TODO
    }

};

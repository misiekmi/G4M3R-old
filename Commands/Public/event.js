const createInteractive = require("./../../Modules/Events/CreateEventInteractive.js");
const listInteractive = require("./../../Modules/Events/ListEventInteractive.js");
module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {

    this.parse = () => {
        const params = suffix.split(" ");

        if (params.length >= 1) {
            this.action = params[0].trim().toLowerCase();
        }
        return true;
    }

    if (!this.parse()) {
        //listInteractive(bot, db, winston, serverDocument, msg);
        	msg.channel.createMessage(`${msg.author.mention}, please specify an action <add/list/edit/remove> | e.g. \`${bot.getCommandPrefix(msg.guild, serverDocument)}event list\``);
    } else {
        switch (this.action) {
            case "add":
                createInteractive(bot, db, winston, serverDocument, msg);
                break;
            case "list":
                listInteractive(bot, db, winston, serverDocument, msg);
                break;
        }
    }
};

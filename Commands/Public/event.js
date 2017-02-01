const create = require("./../../Modules/Events/CreateInteractive.js");
const list = require("./../../Modules/Events/ListInteractive.js");
const show = require("./../../Modules/Events/showEvent.js");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
   
    // settings
	this.hasArgs = false;
	this.isAdmin = false;
	this.firstArg = "";
	this.secondArg = "";


    if( suffix ) {
        switch (suffix.toLowerCase()) {
            case "add":
                create(bot, db, winston, serverDocument, msg);
                break;
            case "list":
                list(bot, db, winston, serverDocument, msg);
                break;
            case "show":
                show(bot, db, winston, serverDocument, msg, hasArgs, firstArg, secondArg);
                break;
        }
    }
    else {
        // probably return a help message TODO yupp
    }

	this.parse = () => {
		const params = suffix.split(" ");

		if(params.length >= 1) {
			this.firstArg = params[1].trim().toLowerCase();
		}

		if(params.length >= 2) {
			this.secondArg = params[2].trim();
		}
        
		const admin_user = serverDocument.config.admins.id(msg.author.id);
		this.isAdmin = admin_user && admin_user.level;
		this.hasArgs = params.length > 1;

		return true;
	};

};
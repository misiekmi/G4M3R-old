const create = require("./../../Modules/Events/CreateInteractive.js");
const list = require("./../../Modules/Events/ListInteractive.js");
const show = require("./../../Modules/Events/showEvent.js");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
   
    // settings
	let hasArgs = false;
	let isAdmin = false;
	let firstArg = 0;
	let secondArg;


    if( suffix ) {
        switch (suffix.toLowerCase()) {
            case "add":
                create(bot, db, winston, serverDocument, msg);
                break;
            case "list":
                list(bot, db, winston, serverDocument, msg);
                break;
            case "show":
                if (parse) {
                show(bot, db, winston, serverDocument, msg, hasArgs, firstArg, secondArg);
                } else {
                    msg.channel.createMessage("Parsing Args failed!");
                }
                break;
        }
    }
    else {
        // probably return a help message TODO yupp
    }

	var parse = () => {
		const params = suffix.split(" ");

		if(params.length >= 1) {
			firstArg = params[1].trim().toLowerCase();
		}

		if(params.length >= 2) {
			secondArg = params[2].trim();
		}
        
		const admin_user = serverDocument.config.admins.id(msg.author.id);
		isAdmin = admin_user && admin_user.level;
		hasArgs = params.length > 1;

		return true;
	};

};
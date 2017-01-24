const async = require("async");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");

    let buffer = serverDocument.gameEvents;

    const max_size = 5;
    let nextPage = () => {
        let description = "";
        for (let i = 1; i <= max_size; i++) {
            let tmp = buffer.shift();
            description += `**${tmp.title}** begins ${tmp.start}\n`;
            buffer.push(tmp);
        }
        description += "\n'next' for next page or 'cancel' to exit interactive";

        return {embed: {description: description}}
    };

    let page = nextPage();
    let cancel = true;

    async.whilst(() => {
            return cancel;
        },
        (callback) => {
            msg.channel.createMessage(page).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    if (usr_message.content.trim() == "cancel") {
                        cancel = false;
                    }
                    else if (usr_message.content.trim() == "next") {
                        page = nextPage();
                    }
                    else {
                        msg.channel.createMessage("I'm sorry, I didn't understand that last message. Try 'cancel' or 'next' next time.");
                        cancel = false;
                    }

                    if (hasDeletePerm)
                        bot_message.delete().then(() => usr_message.delete());

                    callback();
                });
            });
        });
};

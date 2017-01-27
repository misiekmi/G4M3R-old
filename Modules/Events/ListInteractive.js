const async = require("async");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    const max_size = 5;

    let tmp = serverDocument.gameEvents;
    let pages = [];

    let new_page = [];
    let pages_size = 0;
    for( let i = 0; i<tmp.length; i++ ) {
        new_page.push(tmp[i]);
        if((i+1)%max_size==0) {     // if page size has been reached
            pages.push(new_page);   // push the page onto pages,
            pages_size++;           // increase size counter,
            new_page = [];          // reset page,
        }
    }
    if(new_page.length!=0)
        pages.push(new_page);

    let getPage = (x) => {
        let description = "";
        let counter = 1;
        for (let i=0; i<pages[x-1].length; i++) {
            description += `\`\`[${counter++}]\`\` **${pages[x-1][i].title}**\n`;
        }
        description += `\n\`\`[${counter++}]\`\` **Go to next page**\n`;
        description += `\`\`[${counter++}]\`\` **Return to previous page**\n`;
        description += `\`\`[${counter++}]\`\` **Exit view**\n`;

        return {embed: {description: description, footer: {text: `page ${x}/${pages_size}`}}}
    };
    
    let current_page = 1;
    let page = getPage(current_page);
    let cancel = true;
    let usr_err = false;
    let err_msg;

async.whilst(() => {
            return cancel;
        },
        (callback) => {
            msg.channel.createMessage(page).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    if (usr_err) {
                        err_msg.delete();
                        usr_err = false;
                    }

                    let usr_input = usr_message.content.trim();

                    if (usr_input > pages[current_page].length+3 || usr_input <= 0 ) {
                        err_msg = msg.channel.createMessage("That's not an option! Please try again.");
                        usr_err = true;
                    }
                    else if (usr_message.content.trim() <= pages[current_page].length) {
                        // TODO
                    }
                    else if (usr_input == pages[current_page].length+1) {
                        if(current_page+1 > pages_size)
                            current_page = 1;
                        else
                            current_page += 1;

                        page = getPage(current_page);
                    }
                    else if (usr_input == pages[current_page].length+2) {
                        if(current_page-1 <= 0)
                            current_page = pages_size;
                        else
                            current_page -= 1;

                        page = getPage(current_page);
                    }
                    else if(usr_input == pages[current_page].length+3) {
                        cancel = true;
                    }
                    else {
                        err_msg = msg.channel.createMessage("Input numbers only! Please try again.");
                        usr_err = true;
                    }

                    if (hasDeletePerm)
                        bot_message.delete().then(() => usr_message.delete());

                    callback();
                });
            });
        });
};

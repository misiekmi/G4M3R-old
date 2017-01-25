const async = require("async");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    const max_page_size = 7;

    let tmp = serverDocument.gameEvents;
    let pages = [];

    let new_page = [];
    for( let i = 0; i<tmp.length; i++ ) {
        new_page.push(tmp[i]);
        if((i+1)%max_page_size==0) {     // if page size has been reached
            pages.push(new_page);   // push the page onto pages,
            new_page = [];          // reset page,
        }
    }
    if(new_page.length>0)
        pages.push(new_page);

    let current_page_no = 1;

    let getPage = () => {
        let current_page = pages[current_page_no-1];

        let description = "";
        for (let i=0; i<pages[x-1].length; i++) {
            description += `\`\`[${i+1}]\`\` **${pages[current_page_no-1][i].title}**\n`;
        }
        
        if(pages.length>1 && current_page<pages.length )
            description += `\n\`\`[${max_page_size+1}]\`\` **Go to next page**\n`;
        if(current_page>1)
            description += `\`\`[${max_page_size+2}]\`\` **Return to previous page**\n`;
        
        description += `\`\`[cancel]\`\` **Exit view**\n`;

        return {embed: {description: description, footer: {text: `page ${x}/${pages_size}`}}}
    };

    let embed = getPage(current_page);
    let cancel = true;
    let usr_err = false;
    let err_msg;

    async.whilst(() => {
            return cancel;
        },
        (callback) => {
            msg.channel.createMessage(embed).then(bot_message => {
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    if (usr_err) {
                        err_msg.delete();
                        usr_err = false;
                    }

                    let usr_input = usr_message.content.trim();

                    // get event
                    if (usr_message.content.trim() <= pages[current_page_no].length && usr_input > 0) {
                        // TODO
                    }
                    // go to next page
                    else if (usr_input == max_page_size+1) {
                        if(current_page+1 > pages.length)
                            current_page = 1;
                        else
                            current_page += 1;

                        embed = getPage();
                    }
                    // go to previous page
                    else if (usr_input == max_page_size+2 && current_page_no>1) {
                        if(current_page-1 <= 0)
                            current_page = pages.length;
                        else
                            current_page -= 1;

                        embed = getPage();
                    }
                    // exit interactive
                    else if(usr_input.toLowerCase() == "cancel") {
                        cancel = true;
                    }
                    // error
                    else {
                        err_msg = msg.channel.createMessage("That's not an option! Please try again.");
                        usr_err = true;
                    }

                    if (hasDeletePerm)
                        bot_message.delete().then(() => usr_message.delete());

                    callback();
                });
            });
        });
};

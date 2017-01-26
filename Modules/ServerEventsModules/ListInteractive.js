const async = require("async");

module.exports = (bot, db, winston, serverDocument, msg) => {
    const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
    const max_page_size = 7;

    let tmp = serverDocument.gameEvents;
    let pages = [];

    let new_page = [];
    for( let i = 0; i<tmp.length; i++ ) {
        new_page.push(tmp[i]);
        if((i+1)%max_page_size==0) {    // if page size has been reached
            pages.push(new_page);       // push the page onto pages,
            new_page = [];              // reset page,
        }
    }
    if(new_page.length>0)
        pages.push(new_page);

    pages.push([])

    let real_page_size = pages.length-1;
    let current_page_no = 1;

    let getPage = (page_no) => {
        let current_page = pages[page_no-1];

        let description = "";
        for (let i=0; i<current_page.length; i++) {
            description += `\`\`[${i+1}]\`\` **${current_page[i].title}**\n`;
        }

        description += "\n";
        
        if(real_page_size>1 && page_no<real_page_size )
            description += `\`\`[${max_page_size+1}]\`\` **Go to next page**\n`;
        if(page_no>1)
            description += `\`\`[${max_page_size+2}]\`\` **Return to previous page**\n`;

        description += `\`\`[cancel]\`\` **Exit view**\n`;

        return {embed: {description: description, footer: {text: `page ${page_no}/${real_page_size}`}}}
    };

    let embed = getPage(current_page_no);
    let cancel = true;
    let usr_err = false;

    let err_msg;

    async.whilst(() => {
            winston.info(`Checking cancel. . . cancel is: '${cancel}'`, {srvrid: serverDocument._id});
            return cancel;
        },
        (callback) => {
            msg.channel.createMessage(embed).then(bot_message => {
                winston.info(`Current page no: '${current_page_no}', size of pages: ${pages.length}`, {srvrid: serverDocument._id});
                bot.awaitMessage(msg.channel.id, msg.author.id, usr_message => {
                    bot.removeMessageListener(msg.channel.id, msg.author.id);

                    if (usr_err) {
                    //    err_msg.delete();
                        usr_err = false;
                    }

                    let usr_input = usr_message.content.trim();
                    winston.info(`User input: '${usr_input}'`, {srvrid: serverDocument._id});

                    // get event
                    if (usr_message.content.trim() <= pages[current_page_no].length && usr_input > 0) {
                        // TODO
                    }
                    // go to next page
                    else if (usr_input == max_page_size+1 && current_page_no<real_page_size) {
                        current_page_no++;
                        embed = getPage(current_page_no);
                    }
                    // go to previous page
                    else if (usr_input == max_page_size+2 && current_page_no>1) {
                        current_page_no--;
                        embed = getPage(current_page_no);
                    }
                    // exit interactive
                    else if(usr_input.toLowerCase() == "cancel") {
                        cancel = false;
                    }
                    // error
                    else {
                        err_msg = msg.channel.createMessage("That's not an option! Please try again.").then((msg)=> {
                            setTimeout(()=>{msg.delete();},10000)
                        });
                        usr_err = true;
                    }

                    bot_message.delete();
                    if(hasDeletePerm)
                        usr_message.delete();

                    winston.info(`Calling back. . .`, {srvrid: serverDocument._id});
                    callback();
                }, () => bot_message.delete());
            });
        }, (err) => {
            winston.error(`Failed during event list interactive`, {srvrid: serverDocument._id}, err);
        });
};

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {

    //msg.channel.createMessage(`${msg.author.mention} Check your PMs.`);

    //const preInfo = `## **PUBLIC COMMANDS** to use with prefix \`${bot.getCommandPrefix(msg.guild, serverDocument)}\`.` +
    // `\n*## Only showing commands you have permission to use.*\n`;
    //const afterInfo =  `*## For a list of private commands, pm me the text \`help\`.*`;

    const commands = {};
    let category_text = {};
    let distinctCategories = [];
    var desc = "",
        categorySearch = "",
        title = "",
        categoryFound = false,
        categoryNew = "";
    let embed_author = {
        name: bot.user.username,
        icon_url: bot.user.avatarURL,
        url: "https://github.com/pedall/G4M3R"
    };

    const memberBotAdmin = bot.getUserBotAdmin(msg.guild, serverDocument, msg.member);
    bot.getPublicCommandList().forEach(command => {
        if (serverDocument.config.commands[command] && serverDocument.config.commands[command].isEnabled && memberBotAdmin >= serverDocument.config.commands[command].admin_level) {
            const commandData = bot.getPublicCommandMetadata(command);
            if (!commands[commandData.category]) {
                commands[commandData.category] = [];
            }
            commands[commandData.category].push(`\`${command}\``);

            if (!category_text[commandData.category]) {
                category_text[commandData.category] = [];
            }
            category_text[commandData.category].push(`\`${commandData.category_desc}\``);

        }
    });

    if (suffix) {

        Object.keys(commands).sort().forEach(category => {
            categorySearch = category;
            if (categorySearch
                .trim()
                .toLowerCase()
                .includes(suffix.trim().toLowerCase())) {

                //if (suffix.indexOf(commands[category].toString()) > -1) {
                desc = `${commands[category].join(" ")}`;
                categoryFound = true;
                categoryNew = categorySearch;
            }
        });

        if (categoryFound) {
            title = ` | Commands of category [${categoryNew}]`;
        } else {
            title = ` | no category found`;
            desc = `\`${suffix}\` is no valid part of any category!!`;
        }

        msg.channel.createMessage({
            embed: {
                author: {
                    name: bot.user.username + title,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R"
                },
                color: 0xffffff,
                description: desc,
                footer: {
                    text: `type [${bot.getCommandPrefix(msg.guild, serverDocument)}` +
                        `help <commandName> ] to get the respective commands `
                }
            }
        });

    } else {

        Object.keys(commands).sort().forEach(category => {
            distinctCategories[category] = [...new Set(category_text[category])];
            desc += ` ** ${ category } ** -${ distinctCategories[category].toString() }\n `;
        });

        msg.channel.createMessage({
            embed: {
                author: {
                    name: bot.user.username + ` | Command categories `,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R"
                },
                color: 0xffffff,
                description: desc,
                footer: {
                    text: `type [${bot.getCommandPrefix(msg.guild, serverDocument)}` +
                        `commands <category> ] to get the respective commands `
                }
            }
        });

    }
};
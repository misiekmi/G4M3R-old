module.exports = (bot, db, config, winston, userDocument, msg, suffix) => {
    //TODO NOT WORKING IN PM YET SINCE STILL FOCUSSED ON MSG IN A SERVER CHANNEL
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

    bot.getPublicCommandList().forEach(command => {
        const commandData = bot.getPublicCommandMetadata(command);
        if (!commands[commandData.category]) {
            commands[commandData.category] = [];
        }
        commands[commandData.category].push(`\`${command}\``);

        if (!category_text[commandData.category]) {
            category_text[commandData.category] = [];
        }
        category_text[commandData.category].push(`\`${commandData.category_desc}\``);
    });

    if (suffix) {

        if (suffix.trim().toLowerCase() == "all") {

            getAllCommands();

        } else {
            Object.keys(commands).sort().forEach(category => {
                categorySearch = category;
                if (categorySearch
                    .trim()
                    .toLowerCase()
                    .includes(suffix.trim().toLowerCase())) {

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
                        text: `type 'help <commandName>' in any channel on any server to get the respective commands!`
                    }
                }
            });
        }

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
                    text: `type 'commands <category>' to get the respective commands!`
                }
            }
        });

    }

    function getAllCommands() {
        const commands = {};
        let embed_name = "";
        let embed_value = "";
        let embed_fields = [];
        let embed_author = {
            name: bot.user.username,
            icon_url: bot.user.avatarURL,
            url: "https://github.com/pedall/G4M3R"
        };

        bot.getPublicCommandList().forEach(command => {
            const commandData = bot.getPublicCommandMetadata(command);
            if (!commands[commandData.category]) {
                commands[commandData.category] = [];
            }
            commands[commandData.category].push(`\`${command}\``);
        });

        Object.keys(commands).sort().forEach(category => {
            embed_name = `${category}`;
            embed_value = `${commands[category].sort().join(" ")}`;
            embed_fields.push({
                name: embed_name,
                value: embed_value,
                inline: false
            });

        });
        let embed_footer = `For detailed information about each command and all of G4M3R's other features, head over to our wiki: <${config.hosting_url}wiki/Commands>. If you need support using G4M3R, please join our Discord server: <${config.discord_link}>. 🎮`;

        msg.channel.createMessage({
            embed: {
                author: {
                    name: bot.user.username + ` | PUBLIC COMMANDS (use with prefix \`${bot.getCommandPrefix(msg.guild, serverDocument)}\`)`,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R"
                },
                color: 0xffffff,
                fields: embed_fields,
                footer: {
                    text: `type [${bot.getCommandPrefix(msg.guild, serverDocument)}help <commandName>] to get more details` +
                        ` | For a list of private commands, DM me 'help'
                    `
                }
            }
        });
    }

};
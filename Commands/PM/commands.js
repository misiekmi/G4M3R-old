module.exports = (bot, db, config, winston, userDocument, msg, suffix) => {
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

        } else if (suffix.trim().toLowerCase() == "pm") {

            const info = bot.getPMCommandList().map(command => {
                return `\`${command}\`    ${bot.getPMCommandMetadata(command).usage}`;
            }).sort();

            title = `You can use these commands in PM with me:`;
            desc = `${info.join("\n")}`;

            msg.channel.createMessage({
                embed: {
                    author: {
                        name: bot.user.username + ` | Command categories `,
                        icon_url: bot.user.avatarURL,
                        url: "https://github.com/pedall/G4M3R"
                    },
                    title: title,
                    color: 0xffffff,
                    description: desc,
                    footer: {
                        text: `type 'help <command>' to get the respective details!`
                    }
                }
            });

            msg.channel.createMessage(`Learn more at <${config.hosting_url}wiki>`);

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
                    name: bot.user.username + ` | PUBLIC COMMANDS)`,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R"
                },
                color: 0xffffff,
                fields: embed_fields,
                footer: {
                    text: `type 'help <commandName>' to get more details` +
                        ` | For a list of private commands, DM me 'help'`
                }
            }
        });
    }

};
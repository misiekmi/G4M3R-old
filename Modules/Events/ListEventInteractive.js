const moment = require("moment");

module.exports = (bot, db, winston, serverDocument, msg) => {
        const hasDeletePerm = msg.channel.permissionsOf(bot.user.id).has("manageMessages");
        let title, start, end, description, amountMembers;

        // for format options, reference: http://momentjs.com/docs/#/parsing/string-format/
        const formats = ["YYYY/MM/DD H:mm", "YYYY/MM/DD h:mma", "YYYY/MM/DD"];

        // message prompt for title

        let embed_fields = [{
                name: "Title",
                value: `${_event.title}`,
                inline: true
            }; {
                name: "Start-Date",
                value: `${_event.start}`,
                inline: true
            },
            {
                name: "End-Date",
                value: `${_event.end}`,
                inline: true
            },
            {
                name: "Max No Members",
                value: `${_event.maxNoMembers}`,
                inline: true
            },
            {
                name: "Description",
                value: `${_event.description}`,
                inline: true
            }
        ];

        this.list = () => {
            const events = serverDocument.gameEvents..map(_event => {
                    //const content = tag.content.replace(/(https?:[^ ]+)/gi, "<$1>");
                    //return `\`\`\`css\n**Title:** ${_event.title}**: **Start:** ${_event.start} || **End:** ${_event.end} || **Amount Members:**;

                    const embed = {
                        color: 0x9ECDF2,
                        author: {
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL,
                            url: "https://github.com/pedall/G4M3R"
                        },
                        fields: embed_fields,
                        footer: {
                            text: `Type \`9\` for next page | \`8\` for last page`
                        }
                    };
                    return embed;

                };
            }
            this.list();
        };

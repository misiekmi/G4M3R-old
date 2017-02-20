const randomPuppy = require("random-puppy");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg) => {
    randomPuppy().then(url => {
        msg.channel.createMessage({
            embed: {
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                    url: "https://github.com/pedall/G4M3R"
                },
                color: 0x00FF00,
                image: {
                    url: url
                }
            }
        });
    });
};
const config = require("../../Configuration/config.json");
const moment = require("moment-timezone");

/// how to handle the start of an event
function eventStart(bot, winston, db, eventDocument) {
    winston.info(`Event ${eventDocument._id} has started!`);

    if(eventDocument._server) { // loop through attendees and notify
        db.servers.findOne({_id: eventDocument._server}).then(serverDocument => {
            let mentioned = [];         // list of users to mention on the server announcement
            let promises = [];

            let svr = bot.guilds.find(guild=>{return guild.id === serverDocument._id});
            let embed = {};
            embed.color = parseInt(config.colors.blue, 16);
            embed.author = {
                name: `Event \`${eventDocument.title}\` has started on ${svr.name}!`,
                icon_url: "http://frid.li/sSVIJ"
            };
            embed.footer = {text: `Be fair and participate in the events you join`};

            embed.title = `\`${eventDocument.title}\` ends in ${moment(eventDocument.end).fromNow()}`;
            embed.fields = [{
                name: `Description`,
                value: `${eventDocument.description}`,
                inline: false
            }];

            for(let i=0; i<eventDocument.attendees.length; i++) {
                promises.push(db.users.findOne({_id: eventDocument.attendees[i]._id}).then(userDocument => {
                    if(userDocument.event_notifications>0) {
                        if(userDocument.event_notifications>=2) {   // handles levels
                            mentioned.push(userDocument._id);       // 2 and 3
                        }
                        if(userDocument.event_notifications!==2) {  // handles levels 1 and 3
                            //let msg_content = `**Event Notification:** Event \`\`${eventDocument.title}\`\` has begun`;
                            let msg_content = {embed: embed};

                            bot.getDMChannel(userDocument._id).then(privateChannel => {
                                return privateChannel.createMessage(msg_content)
                            }).catch((err)=> {
                                winston.warn(err);
                            })
                        }
                    }
                }));
            }

            Promise.all(promises).then(()=> {
                if(serverDocument.event_channels.announce) {
                    let msg_content = `Event \`\`${eventDocument.title}\`\` has begun!\n`;
                    for(let i=0; i<mentioned.length; i++) {
                        if(msg_content.length>1900) {
                            bot.createMessage(serverDocument.event_channels.announce, msg_content);
                            msg_content = `\`\`continued. . .\`\` `
                        }
                        msg_content += `<@${mentioned[i]}> `
                    }
                    bot.createMessage(serverDocument.event_channels.announce, msg_content).then(()=> {
                        winston.info("Successfully announced the start of the event!");
                    });
                }
            });
        });
    }

    // set the started flag
    eventDocument.hasStarted = true;
    eventDocument.save((err)=> {
        if(err) {
            winston.info(err.stack);
        }
    });
}

/// how to handle the end of an event
function eventEnd(bot, winston, db, eventDocument) {
    db.events.remove({_id:eventDocument._id}, (err)=> {
        if(err) {
            winston.info(err.stack);
        }
    });
}

module.exports = (bot, winston, db) => {

    // queries mongodb for expiring events and operates on said events
    //!! timer is started at line 253 of Events/ready.js
    winston.info("Started event time checker auto-loop");
    (function(){
        // query for events that should be started
        db.events.find({
            $and: [{
                "start": { $lte : Date.now()}}, {
                "hasStarted": false
            }]
        }).then((events)=> {  // start events
            for(let i=0; i<events.length; i++) {
                let event = events[i];
                eventStart(bot, winston, db, event);
            }
        }).then(()=> {
            // query for events that should be ended
            db.events.find({
                "end": { $lte : Date.now() }
            }).then((events)=> {    // end events
                for(let i=0; i<events.length; i++) {
                    let event = events[i];
                    // event has ended
                    eventEnd(bot, winston, db, event);
                }
            }).then(()=> {
                // finally, repeat the function again in 60 seconds
                setTimeout(arguments.callee, 60*1000 );
            });
        });
    })();
};


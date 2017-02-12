/// how to handle the start of an event
function eventStart(bot, winston, db, eventDocument) {
    winston.info(`Event ${eventDocument._id} has started!`);

    if(eventDocument._server) { // loop through attendees and notify
        db.events.findOne({_id: eventDocument._server}).then(serverDocument => {
            let mentioned = [];         // list of users to mention on the server announcement

            for(let i=0; i<eventDocument.attendees.length; i++) {
                console.log(i);
                db.users.findOne({_id: eventDocument.attendees[i]._id}).then(userDocument => {
                    if(userDocument.event_notifications>0) {
                        if(userDocument.event_notifications>=2) {   // handles levels
                            mentioned.push(userDocument._id);       // 2 and 3
                        }
                        if(userDocument.event_notifications!==2) {  // handles levels 1 and 3
                            let msg_content = `**Event Notification:** Event \`\`${eventDocument.title}\`\` has started`;

                            bot.getDMChannel(userDocument._id).then(privateChannel => {
                                return privateChannel.createMessage(msg_content)
                            }).catch((err)=> {
                                console.log(err);
                            })
                        }
                    }
                })
            }

            // TODO mention all users in array
            //if(serverDocument.notification_channel) {
            //}
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


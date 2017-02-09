
/// how to handle the start of an event
function eventStart(winston, db, eventDocument) {
    winston.info(`Event #${eventDocument._id} has started!`);
    eventDocument.hasStarted = true;
    eventDocument.save((err)=>{
        if(err){
            winston.info(err.stack);
        }
    });
}

/// how to handle the end of an event
function eventEnd(winston, db, eventDocument) {
    winston.info(`Event #${eventDocument._id} has ended!`);
    db.events.remove({_id:eventDocument._id}, (err)=> {
        if(err) {
            winston.info(err.stack);
        }
    });
}

module.exports = (winston, db) => {

    // queries mongodb for expiring events and operates on said events
    //!! timer is started at line 253 of Events/ready.js
    (function(){
        winston.info("looping. . .");
        // query for events that should be started
        db.events.find({
            $and: [{
                "start": { $lte : Date.now()}}, {
                "hasStarted": false
            }]
        }).then((events)=> {  // start events
            for(let i=0; i<events.length; i++) {
                let event = events[i];
                eventStart(winston, db, event);
            }
        }).then(()=> {
            // query for events that should be ended
            db.events.find({
                "end": { $lte : Date.now() }
            }).then((events)=> {    // end events
                for(let i=0; i<events.length; i++) {
                    let event = events[i];
                    // event has ended
                    eventEnd(winston, db, event);
                }
            }).then(()=>{
                // finally, repeat the function again in 60 seconds
                setTimeout(arguments.callee, 60*1000 );
            });
        });
    })();
};


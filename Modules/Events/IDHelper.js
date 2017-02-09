const crypto = require('crypto');
const queryHelper = require('./EventsQueryHelper');

module.exports = {
    // computes the unique ID of an event from it's event number, author, server, and clan information
    computeID: (_no, _author, _server, _clan) => {
        return crypto.createHash('sha1')
				.update(''+_no+_author+(_server?_server:"")+(_clan?_clan:""))
				.digest('base64')
    },

    // returns a promise returning a new event ID unique to the server
    newServerEventNumber: (db, _server) => {
        return queryHelper.findServerEvents(db, _server).then((events)=>{
            let id = 1;
            for(let i=0; i<events.length; i++) {
                if(events[i]._no!==id) {
                    break;
                }
                id++;
            }
            return id;
        });
    },
};

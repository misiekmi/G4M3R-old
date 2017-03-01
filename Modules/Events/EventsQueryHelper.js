module.exports = {
    // sorted by start time
    findServerEvents: (db, _server) => {
        return db.events.find({ _server: _server }).sort({ start: 1 });
    },

    findPersonalEvents: (db, _author) => {
        return db.events.find({
            $and: [
                { _author: _author },
                { _server: null },
                { _clan: null }
            ]
        });
    },

    findClanEvents: (db, _clan) => {
        return db.events.find({ _clan: _clan });
    },

    findFilteredServerEvents: (db, _server, filter) => {
        return db.events.find({ _server: _server }).sort({ start: 1 }).then((events) => {
            if (filter) {
                let tmp = [];


                //iterate over all events
                for (let i = 0; i < events.length; i++) {
                    let event = events[i];
                    let pass = true;
                    let found = false;

                    if (filter._author && event._author !== filter._author) {
                        pass = false;
                    } else if (filter.tags) {
                        for (let j = 0; j < filter.tags.length; j++) {

                            for (let k = 0; k < event.tags.length; k++) {
                                //found = false;
                                if (filter.tags[j].trim().toLowerCase() === event.tags[k].trim().toLowerCase()) {
                                    found = true;
                                    //break;
                                }
                            }
                        }

                        pass = found && pass;
                    }

                    if (pass) {
                        tmp.push(event);
                    }
                }
                return tmp;
            } else {
                return events;
            }
        });
    },
};